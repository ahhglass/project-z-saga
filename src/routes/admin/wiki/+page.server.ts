import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getSupabaseServer } from '$lib/supabaseServer';
import {
	loadWikiCategories,
	WIKI_SEED_ENTRIES,
	invalidateWikiArticlesCache,
	isValidWikiCategoryId,
	wikiDefaultCategories
} from '$lib/data/wiki';
import type { WikiCategory } from '$lib/data/wiki';

export type WikiAdminRow = {
	id: string;
	slug: string;
	title: string;
	category_id: string;
	body: string;
	excerpt: string | null;
	sort_order: number;
	hidden: boolean;
	updated_at: string | null;
};

function sortWikiRows(rows: WikiAdminRow[], categories: WikiCategory[]): WikiAdminRow[] {
	const order = new Map(categories.map((c) => [c.id, c.sortOrder]));
	return [...rows].sort((a, b) => {
		const ao = order.get(a.category_id) ?? 99999;
		const bo = order.get(b.category_id) ?? 99999;
		if (ao !== bo) return ao - bo;
		if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
		return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
	});
}

function normalizeSlug(raw: string): string {
	const t = raw.trim().toLowerCase().replace(/\s+/g, '-');
	return t.replace(/[^a-z0-9-]/g, '');
}

function parseHidden(form: FormData): boolean {
	const v = form.get('hidden');
	return v === 'on' || v === 'true' || v === '1';
}

function explainWikiLoadFailure(message: string, cause?: string): string {
	const m = `${message}${cause ? ` (${cause})` : ''}`;
	const lower = m.toLowerCase();
	if (
		lower.includes('fetch failed') ||
		lower.includes('econnrefused') ||
		lower.includes('enotfound') ||
		lower.includes('certificate') ||
		lower.includes('network') ||
		lower.includes('socket')
	) {
		return `${m}\n\nLikely network or env: check PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (.env.local).`;
	}
	return `${m}\n\nIf it mentions a column/RLS, verify wiki_articles / wiki_categories columns match the app.`;
}

async function mergedCategoriesSafe(): Promise<WikiCategory[]> {
	try {
		return await loadWikiCategories();
	} catch {
		return wikiDefaultCategories;
	}
}

export const load: PageServerLoad = async () => {
	const merged = await mergedCategoriesSafe();
	let categoryDbIds: string[] = [];
	try {
		const supabase = getSupabaseServer();
		const { data: idRows, error: idErr } = await supabase.from('wiki_categories').select('id');
		if (!idErr && idRows?.length) {
			categoryDbIds = (idRows as { id: string }[]).map((r) => r.id);
		}
	} catch {
		// table may not exist yet
	}

	try {
		const supabase = getSupabaseServer();
		const { data, error } = await supabase
			.from('wiki_articles')
			.select('id, slug, title, category_id, body, excerpt, sort_order, hidden, updated_at')
			.order('category_id', { ascending: true })
			.order('sort_order', { ascending: true });

		if (error) {
			return {
				items: [] as WikiAdminRow[],
				categories: merged,
				categoryDbIds,
				loadError: explainWikiLoadFailure(error.message, error.details ?? undefined)
			};
		}

		return {
			items: sortWikiRows((data ?? []) as WikiAdminRow[], merged),
			categories: merged,
			categoryDbIds
		};
	} catch (e) {
		const message = e instanceof Error ? e.message : String(e);
		const cause = e instanceof Error && 'cause' in e && e.cause ? String(e.cause) : undefined;
		return {
			items: [] as WikiAdminRow[],
			categories: merged,
			categoryDbIds,
			loadError: explainWikiLoadFailure(message, cause)
		};
	}
};

export const actions: Actions = {
	create: async ({ request }) => {
		const form = await request.formData();
		const rawSlug = (form.get('slug') as string) || '';
		const slug = normalizeSlug(rawSlug);
		const title = (form.get('title') as string)?.trim() || '';
		const category_id = ((form.get('category_id') as string) || '').trim();
		const body = (form.get('body') as string) || '';
		const excerpt = ((form.get('excerpt') as string) || '').trim() || null;
		const sort_order = Math.max(0, parseInt(String(form.get('sort_order')), 10) || 0);
		const hidden = parseHidden(form);

		const cats = await mergedCategoriesSafe();
		if (!cats.some((c) => c.id === category_id)) {
			return fail(400, { createError: 'Choose a valid category.' });
		}
		if (!slug) {
			return fail(400, { createError: 'Slug is required (letters, numbers, hyphens).' });
		}
		if (!title) {
			return fail(400, { createError: 'Title is required.' });
		}

		const supabase = getSupabaseServer();
		const { error } = await supabase.from('wiki_articles').insert({
			slug,
			title,
			category_id,
			body,
			excerpt,
			sort_order,
			hidden,
			updated_at: new Date().toISOString()
		});
		if (error) {
			return fail(500, { createError: error.message });
		}
		invalidateWikiArticlesCache();
		return { createSuccess: true };
	},

	update: async ({ request }) => {
		const form = await request.formData();
		const id = ((form.get('id') as string) || '').trim();
		const rawSlug = (form.get('slug') as string) || '';
		const slug = normalizeSlug(rawSlug);
		const title = (form.get('title') as string)?.trim() || '';
		const category_id = ((form.get('category_id') as string) || '').trim();
		const body = (form.get('body') as string) || '';
		const excerpt = ((form.get('excerpt') as string) || '').trim() || null;
		const sort_order = Math.max(0, parseInt(String(form.get('sort_order')), 10) || 0);
		const hidden = parseHidden(form);

		if (!id) {
			return fail(400, { updateError: 'Missing article id.' });
		}
		const cats = await mergedCategoriesSafe();
		if (!cats.some((c) => c.id === category_id)) {
			return fail(400, { updateError: 'Choose a valid category.' });
		}
		if (!slug) {
			return fail(400, { updateError: 'Slug is required.' });
		}
		if (!title) {
			return fail(400, { updateError: 'Title is required.' });
		}

		const supabase = getSupabaseServer();
		const { error } = await supabase
			.from('wiki_articles')
			.update({
				slug,
				title,
				category_id,
				body,
				excerpt,
				sort_order,
				hidden,
				updated_at: new Date().toISOString()
			})
			.eq('id', id);

		if (error) {
			return fail(500, { updateError: error.message });
		}
		invalidateWikiArticlesCache();
		return { updateSuccess: true };
	},

	delete: async ({ request }) => {
		const form = await request.formData();
		const id = ((form.get('id') as string) || '').trim();
		if (!id) return fail(400, { deleteError: 'Missing id.' });
		const supabase = getSupabaseServer();
		const { error } = await supabase.from('wiki_articles').delete().eq('id', id);
		if (error) {
			return fail(500, { deleteError: error.message });
		}
		invalidateWikiArticlesCache();
		return { deleteSuccess: true };
	},

	seedStarters: async () => {
		const supabase = getSupabaseServer();
		const { count, error: countError } = await supabase
			.from('wiki_articles')
			.select('id', { count: 'exact', head: true });

		if (countError) {
			return fail(500, { seedError: countError.message });
		}
		if ((count ?? 0) > 0) {
			return fail(400, {
				seedError:
					'wiki_articles is not empty — delete existing rows first, or create pages manually.'
			});
		}

		const ts = new Date().toISOString();
		const rows = WIKI_SEED_ENTRIES.map((e) => ({
			slug: e.slug,
			title: e.title,
			category_id: e.categoryId,
			body: e.bodyMarkdown,
			excerpt: e.excerpt,
			sort_order: e.sortOrder,
			hidden: false,
			updated_at: ts
		}));

		const { error } = await supabase.from('wiki_articles').insert(rows);
		if (error) {
			return fail(500, { seedError: error.message });
		}
		invalidateWikiArticlesCache();
		return { seedSuccess: true, seedCount: rows.length };
	},

	categoryCreate: async ({ request }) => {
		const form = await request.formData();
		const rawId = (form.get('cat_id') as string) || '';
		const id = normalizeSlug(rawId);
		const title = (form.get('cat_title') as string)?.trim() || '';
		const description = ((form.get('cat_description') as string) || '').trim();
		const sort_order = Math.max(0, parseInt(String(form.get('cat_sort_order')), 10) || 0);

		if (!isValidWikiCategoryId(id)) {
			return fail(400, {
				categoryError: 'Category URL id: lowercase letters, numbers, hyphens only (e.g. my-topic).'
			});
		}
		if (!title) {
			return fail(400, { categoryError: 'Category title is required.' });
		}
		const merged = await mergedCategoriesSafe();
		if (merged.some((c) => c.id === id)) {
			return fail(400, { categoryError: 'That category id already exists.' });
		}

		const supabase = getSupabaseServer();
		const { error } = await supabase.from('wiki_categories').insert({
			id,
			title,
			description,
			sort_order
		});
		if (error) {
			return fail(500, { categoryError: error.message });
		}
		invalidateWikiArticlesCache();
		return { categorySuccess: 'created' as const };
	},

	categoryUpdate: async ({ request }) => {
		const form = await request.formData();
		const id = ((form.get('cat_id') as string) || '').trim();
		const title = (form.get('cat_title') as string)?.trim() || '';
		const description = ((form.get('cat_description') as string) || '').trim();
		const sort_order = Math.max(0, parseInt(String(form.get('cat_sort_order')), 10) || 0);

		if (!isValidWikiCategoryId(id)) {
			return fail(400, { categoryError: 'Invalid category id.' });
		}
		if (!title) {
			return fail(400, { categoryError: 'Category title is required.' });
		}
		const merged = await mergedCategoriesSafe();
		if (!merged.some((c) => c.id === id)) {
			return fail(400, { categoryError: 'Unknown category id.' });
		}

		const supabase = getSupabaseServer();
		const { error } = await supabase.from('wiki_categories').upsert(
			{
				id,
				title,
				description,
				sort_order
			},
			{ onConflict: 'id' }
		);
		if (error) {
			return fail(500, { categoryError: error.message });
		}
		invalidateWikiArticlesCache();
		return { categorySuccess: 'updated' as const };
	},

	categoryDelete: async ({ request }) => {
		const form = await request.formData();
		const id = ((form.get('cat_id') as string) || '').trim();
		if (!isValidWikiCategoryId(id)) {
			return fail(400, { categoryError: 'Invalid category id.' });
		}

		const supabase = getSupabaseServer();
		const { data: row, error: selErr } = await supabase.from('wiki_categories').select('id').eq('id', id).maybeSingle();
		if (selErr) {
			return fail(500, { categoryError: selErr.message });
		}
		if (!row) {
			return fail(400, {
				categoryError: 'Nothing to delete — built-in categories only exist in code until you save an override.'
			});
		}

		const { count, error: cntErr } = await supabase
			.from('wiki_articles')
			.select('id', { count: 'exact', head: true })
			.eq('category_id', id);
		if (cntErr) {
			return fail(500, { categoryError: cntErr.message });
		}
		if ((count ?? 0) > 0) {
			return fail(400, {
				categoryError: `Move or delete ${count} article(s) in this category first.`
			});
		}

		const { error } = await supabase.from('wiki_categories').delete().eq('id', id);
		if (error) {
			return fail(500, { categoryError: error.message });
		}
		invalidateWikiArticlesCache();
		return { categorySuccess: 'deleted' as const };
	}
};
