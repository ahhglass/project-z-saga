export type WikiCategoryId = string;

export type WikiCategory = {
	id: WikiCategoryId;
	title: string;
	description: string;
	sortOrder: number;
};

export type WikiArticle = {
	slug: string;
	title: string;
	categoryId: WikiCategoryId;
	excerpt: string;
	html: string;
	sortOrder: number;
	updatedAt?: string;
};
