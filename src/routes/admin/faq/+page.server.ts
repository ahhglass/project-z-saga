import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getSupabaseServer } from '$lib/supabaseServer';

export type FaqRow = {
	id: string;
	question: string;
	answer: string;
	tag: string;
	sort_order: number;
	created_at?: string;
	updated_at?: string;
};

export const load: PageServerLoad = async () => {
	const supabase = getSupabaseServer();
	const { data, error } = await supabase
		.from('faq_items')
		.select('id, question, answer, tag, sort_order, created_at, updated_at')
		.order('sort_order', { ascending: true });
	if (error) {
		return { items: [] as FaqRow[], error: error.message };
	}
	return { items: (data ?? []) as FaqRow[] };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const form = await request.formData();
		const id = (form.get('id') as string)?.trim().toLowerCase().replace(/\s+/g, '-') || '';
		const question = (form.get('question') as string)?.trim() || '';
		const answer = (form.get('answer') as string)?.trim() || '';
		const tag = (form.get('tag') as string)?.trim() || 'ABOUT';
		const sort_order = Math.max(0, parseInt(String(form.get('sort_order')), 10) || 0);
		if (!id || !question || !answer) {
			return fail(400, { createError: 'ID, question and answer are required.' });
		}
		const supabase = getSupabaseServer();
		const { error } = await supabase.from('faq_items').insert({
			id,
			question,
			answer,
			tag,
			sort_order,
			updated_at: new Date().toISOString()
		});
		if (error) {
			return fail(500, { createError: error.message });
		}
		return { createSuccess: true };
	},
	update: async ({ request }) => {
		const form = await request.formData();
		const id = (form.get('id') as string)?.trim() || '';
		const question = (form.get('question') as string)?.trim() || '';
		const answer = (form.get('answer') as string)?.trim() || '';
		const tag = (form.get('tag') as string)?.trim() || 'ABOUT';
		const sort_order = Math.max(0, parseInt(String(form.get('sort_order')), 10) || 0);
		if (!id || !question || !answer) {
			return fail(400, { updateError: 'ID, question and answer are required.' });
		}
		const supabase = getSupabaseServer();
		const { error } = await supabase
			.from('faq_items')
			.update({ question, answer, tag, sort_order, updated_at: new Date().toISOString() })
			.eq('id', id);
		if (error) {
			return fail(500, { updateError: error.message });
		}
		return { updateSuccess: true };
	},
	delete: async ({ request }) => {
		const form = await request.formData();
		const id = (form.get('id') as string)?.trim() || '';
		if (!id) return fail(400, { deleteError: 'ID required.' });
		const supabase = getSupabaseServer();
		const { error } = await supabase.from('faq_items').delete().eq('id', id);
		if (error) {
			return fail(500, { deleteError: error.message });
		}
		return { deleteSuccess: true };
	}
};
