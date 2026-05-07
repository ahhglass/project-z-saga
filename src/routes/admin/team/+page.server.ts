import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getSupabaseServer } from '$lib/supabaseServer';

export type TeamSectionRow = { id: string; title: string; sort_order: number };
export type TeamMemberRow = {
	id: string;
	section_id: string;
	name: string;
	role: string;
	description: string | null;
	avatar: string | null;
	tags: string[];
	socials: { url: string; type: string; label?: string }[];
	sort_order: number;
};

function parseTags(v: string): string[] {
	return (v || '').split(',').map((t) => t.trim()).filter(Boolean);
}

function parseSocials(v: string): { url: string; type: string; label?: string }[] {
	const lines = (v || '').split(/\n/).map((l) => l.trim()).filter(Boolean);
	const out: { url: string; type: string; label?: string }[] = [];
	const types = ['telegram', 'github', 'x', 'discord', 'email', 'linkedin'];
	for (const line of lines) {
		const parts = line.split(/\s+/);
		const url = parts[0] ?? '';
		const type = (parts[1] ?? 'telegram').toLowerCase();
		const label = parts.slice(2).join(' ') || undefined;
		if (url && types.includes(type)) out.push({ url, type, label });
	}
	return out;
}

function socialsToText(arr: { url: string; type: string; label?: string }[]): string {
	return (arr ?? []).map((s) => [s.url, s.type, s.label].filter(Boolean).join(' ')).join('\n');
}

export const load: PageServerLoad = async () => {
	const supabase = getSupabaseServer();
	const [secRes, memRes] = await Promise.all([
		supabase.from('team_sections').select('id, title, sort_order').order('sort_order', { ascending: true }),
		supabase.from('team_members').select('id, section_id, name, role, description, avatar, tags, socials, sort_order').order('sort_order', { ascending: true })
	]);
	const sections = (secRes.data ?? []) as TeamSectionRow[];
	const members = (memRes.data ?? []) as TeamMemberRow[];
	return {
		sections: secRes.error ? [] : sections,
		members: memRes.error ? [] : members,
		error: secRes.error?.message ?? memRes.error?.message
	};
};

export const actions: Actions = {
	createSection: async ({ request }) => {
		const form = await request.formData();
		const id = (form.get('id') as string)?.trim().toLowerCase().replace(/\s+/g, '-') || '';
		const title = (form.get('title') as string)?.trim() || '';
		const sort_order = Math.max(0, parseInt(String(form.get('sort_order')), 10) || 0);
		if (!id || !title) return fail(400, { createSectionError: 'ID and title required.' });
		const supabase = getSupabaseServer();
		const { error } = await supabase.from('team_sections').insert({
			id,
			title,
			sort_order,
			updated_at: new Date().toISOString()
		});
		if (error) return fail(500, { createSectionError: error.message });
		return { createSectionSuccess: true };
	},
	updateSection: async ({ request }) => {
		const form = await request.formData();
		const id = (form.get('id') as string)?.trim() || '';
		const title = (form.get('title') as string)?.trim() || '';
		const sort_order = Math.max(0, parseInt(String(form.get('sort_order')), 10) || 0);
		if (!id || !title) return fail(400, { updateSectionError: 'ID and title required.' });
		const supabase = getSupabaseServer();
		const { error } = await supabase.from('team_sections').update({ title, sort_order, updated_at: new Date().toISOString() }).eq('id', id);
		if (error) return fail(500, { updateSectionError: error.message });
		return { updateSectionSuccess: true };
	},
	deleteSection: async ({ request }) => {
		const id = (await request.formData()).get('id') as string;
		if (!id?.trim()) return fail(400, { deleteSectionError: 'ID required.' });
		const supabase = getSupabaseServer();
		const { error } = await supabase.from('team_sections').delete().eq('id', id.trim());
		if (error) return fail(500, { deleteSectionError: error.message });
		return { deleteSectionSuccess: true };
	},
	createMember: async ({ request }) => {
		const form = await request.formData();
		const section_id = (form.get('section_id') as string)?.trim() || '';
		const name = (form.get('name') as string)?.trim() || '';
		const role = (form.get('role') as string)?.trim() || '';
		const description = (form.get('description') as string)?.trim() || null;
		const avatar = (form.get('avatar') as string)?.trim() || null;
		const tags = parseTags((form.get('tags') as string) || '');
		const socials = parseSocials((form.get('socials') as string) || '');
		const sort_order = Math.max(0, parseInt(String(form.get('sort_order')), 10) || 0);
		if (!section_id || !name) return fail(400, { createMemberError: 'Section and name required.' });
		const supabase = getSupabaseServer();
		const { error } = await supabase.from('team_members').insert({
			section_id,
			name,
			role,
			description,
			avatar,
			tags,
			socials,
			sort_order,
			updated_at: new Date().toISOString()
		});
		if (error) return fail(500, { createMemberError: error.message });
		return { createMemberSuccess: true };
	},
	updateMember: async ({ request }) => {
		const form = await request.formData();
		const id = (form.get('id') as string)?.trim() || '';
		const section_id = (form.get('section_id') as string)?.trim() || '';
		const name = (form.get('name') as string)?.trim() || '';
		const role = (form.get('role') as string)?.trim() || '';
		const description = (form.get('description') as string)?.trim() || null;
		const avatar = (form.get('avatar') as string)?.trim() || null;
		const tags = parseTags((form.get('tags') as string) || '');
		const socials = parseSocials((form.get('socials') as string) || '');
		const sort_order = Math.max(0, parseInt(String(form.get('sort_order')), 10) || 0);
		if (!id || !section_id || !name) return fail(400, { updateMemberError: 'ID, section and name required.' });
		const supabase = getSupabaseServer();
		const { error } = await supabase.from('team_members').update({
			section_id,
			name,
			role,
			description,
			avatar,
			tags,
			socials,
			sort_order,
			updated_at: new Date().toISOString()
		}).eq('id', id);
		if (error) return fail(500, { updateMemberError: error.message });
		return { updateMemberSuccess: true };
	},
	deleteMember: async ({ request }) => {
		const id = (await request.formData()).get('id') as string;
		if (!id?.trim()) return fail(400, { deleteMemberError: 'ID required.' });
		const supabase = getSupabaseServer();
		const { error } = await supabase.from('team_members').delete().eq('id', id.trim());
		if (error) return fail(500, { deleteMemberError: error.message });
		return { deleteMemberSuccess: true };
	}
};
