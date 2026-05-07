import type { PageServerLoad } from './$types';
import { getSupabaseServer } from '$lib/supabaseServer';
import { faqItems, faqTags } from '$lib/data/faq';
import type { FaqItem } from '$lib/data/faq';

export const load: PageServerLoad = async () => {
	try {
		const supabase = getSupabaseServer();
		const { data, error } = await supabase
			.from('faq_items')
			.select('id, question, answer, tag')
			.order('sort_order', { ascending: true });
		if (!error && data?.length) {
			const items: FaqItem[] = data.map((r) => ({
				id: r.id,
				question: r.question,
				answer: r.answer,
				tag: r.tag
			}));
			const tags = [...new Set(items.map((i) => i.tag))].sort();
			return { items, tags };
		}
	} catch (_) {
		// fallback to file data
	}
	return {
		items: faqItems,
		tags: faqTags
	};
};
