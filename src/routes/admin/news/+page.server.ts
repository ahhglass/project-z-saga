import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getSupabaseServer } from '$lib/supabaseServer';
import type { NewsRow } from '$lib/data/news-posts/fromSupabase';

const NEWS_BUCKET = 'news-images';

async function ensureBucket(supabase: ReturnType<typeof getSupabaseServer>) {
	await supabase.storage.createBucket(NEWS_BUCKET, { public: true }).catch(() => {});
}

/** Upload a file to Supabase Storage; returns public URL or null on error */
async function uploadCover(
	supabase: ReturnType<typeof getSupabaseServer>,
	file: File,
	slug: string
): Promise<string | null> {
	await ensureBucket(supabase);
	const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
	const safe = /^[a-z0-9.-]+$/i.test(ext) ? ext : 'jpg';
	const path = `${slug}-${Date.now()}.${safe}`;
	const { error } = await supabase.storage.from(NEWS_BUCKET).upload(path, file, {
		contentType: file.type || 'image/jpeg',
		upsert: false
	});
	if (error) return null;
	const { data } = supabase.storage.from(NEWS_BUCKET).getPublicUrl(path);
	return data.publicUrl;
}

function parseTags(v: string): string[] {
	return (v || '')
		.split(',')
		.map((t) => t.trim())
		.filter(Boolean);
}

function toIso(d: string): string {
	if (!d) return new Date().toISOString();
	const date = new Date(d);
	return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

export const load: PageServerLoad = async () => {
	const supabase = getSupabaseServer();
	const { data, error } = await supabase
		.from('news_posts')
		.select('slug, title, date, updated, excerpt, body, cover_image, tags, hidden')
		.order('date', { ascending: false });
	if (error) {
		return { items: [] as NewsRow[], error: error.message };
	}
	return { items: (data ?? []) as NewsRow[] };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const form = await request.formData();
		const slug = (form.get('slug') as string)?.trim().toLowerCase().replace(/\s+/g, '-') || '';
		const title = (form.get('title') as string)?.trim() || '';
		const date = toIso((form.get('date') as string) || '');
		const updatedRaw = (form.get('updated') as string)?.trim() || '';
		const updated = updatedRaw ? toIso(updatedRaw) : new Date().toISOString();
		const excerpt = (form.get('excerpt') as string)?.trim() || '';
		const body = (form.get('body') as string)?.trim() || '';
		let cover_image = (form.get('cover_image') as string)?.trim() || null;
		const coverFile = form.get('cover_file') as File | null;
		if (coverFile?.size && coverFile?.type?.startsWith('image/')) {
			const supabase = getSupabaseServer();
			const url = await uploadCover(supabase, coverFile, slug);
			if (url) cover_image = url;
		}
		const tags = parseTags((form.get('tags') as string) || '');
		const hidden = form.get('hidden') === 'on' || form.get('hidden') === 'true';
		if (!slug || !title) {
			return fail(400, { createError: 'Slug and title are required.' });
		}
		const supabase = getSupabaseServer();
		const { error } = await supabase.from('news_posts').insert({
			slug,
			title,
			date,
			updated,
			excerpt,
			body,
			cover_image,
			tags,
			hidden,
			updated_at: new Date().toISOString()
		});
		if (error) {
			return fail(500, { createError: error.message });
		}
		return { createSuccess: true };
	},
	update: async ({ request }) => {
		const form = await request.formData();
		const slug = (form.get('slug') as string)?.trim() || '';
		const title = (form.get('title') as string)?.trim() || '';
		const date = toIso((form.get('date') as string) || '');
		// Always set "updated" to now when saving an edit, so the post shows the last change date
		const updated = new Date().toISOString();
		const excerpt = (form.get('excerpt') as string)?.trim() ?? '';
		const body = (form.get('body') as string)?.trim() ?? '';
		const coverImageRaw = (form.get('cover_image') as string)?.trim() ?? '';
		let cover_image: string | null = coverImageRaw || null;
		const coverFile = form.get('cover_file') as File | null;
		if (coverFile?.size && coverFile?.type?.startsWith('image/')) {
			const supabase = getSupabaseServer();
			const url = await uploadCover(supabase, coverFile, slug);
			if (url) cover_image = url;
		}
		const tags = parseTags((form.get('tags') as string) ?? '');
		const hidden = form.get('hidden') === 'on' || form.get('hidden') === 'true';
		if (!slug || !title) {
			return fail(400, { updateError: 'Slug and title are required.' });
		}
		const supabase = getSupabaseServer();
		const { error } = await supabase
			.from('news_posts')
			.update({
				title,
				date,
				updated,
				excerpt,
				body,
				cover_image,
				tags,
				hidden,
				updated_at: new Date().toISOString()
			})
			.eq('slug', slug);
		if (error) {
			return fail(500, { updateError: error.message });
		}
		return { updateSuccess: true };
	},
	delete: async ({ request }) => {
		const form = await request.formData();
		const slug = (form.get('slug') as string)?.trim() || '';
		if (!slug) return fail(400, { deleteError: 'Slug required.' });
		const supabase = getSupabaseServer();
		const { error } = await supabase.from('news_posts').delete().eq('slug', slug);
		if (error) {
			return fail(500, { deleteError: error.message });
		}
		return { deleteSuccess: true };
	}
};
