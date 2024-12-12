export default function slugify(text: string) {
	return text.toLowerCase().replace(/ /g, '-');
}
