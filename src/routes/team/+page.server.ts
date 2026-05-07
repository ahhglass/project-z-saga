import type { PageServerLoad } from './$types';
import { getSupabaseServer } from '$lib/supabaseServer';
import { teamSections } from '$lib/data/team';
import type { TeamSection, TeamMember } from '$lib/data/team';

type MemberRow = {
	id: string;
	section_id: string;
	name: string;
	role: string;
	description: string | null;
	avatar: string | null;
	tags: string[] | null;
	socials: { url: string; type: string; label?: string }[] | null;
	sort_order: number;
};

export const load: PageServerLoad = async () => {
	try {
		const supabase = getSupabaseServer();
		const [secRes, memRes] = await Promise.all([
			supabase.from('team_sections').select('id, title, sort_order').order('sort_order', { ascending: true }),
			supabase.from('team_members').select('id, section_id, name, role, description, avatar, tags, socials, sort_order').order('sort_order', { ascending: true })
		]);
		if (secRes.error || memRes.error || !secRes.data?.length) {
			return { sections: teamSections };
		}
		const sectionsData = secRes.data as { id: string; title: string; sort_order: number }[];
		const membersData = (memRes.data ?? []) as MemberRow[];
		const sections: TeamSection[] = sectionsData.map((sec) => {
			const mems = membersData
				.filter((m) => m.section_id === sec.id)
				.sort((a, b) => a.sort_order - b.sort_order)
				.map((m): TeamMember => ({
					name: m.name,
					role: m.role,
					description: m.description ?? undefined,
					avatar: m.avatar ?? undefined,
					tags: m.tags ?? [],
					socials: (m.socials ?? []) as TeamMember['socials']
				}));
			return { id: sec.id, title: sec.title, members: mems };
		});
		return { sections };
	} catch {
		return { sections: teamSections };
	}
};
