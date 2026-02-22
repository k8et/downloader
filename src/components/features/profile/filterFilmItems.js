export function filterFilmItems(items, query) {
  if (!query?.trim()) return items
  const q = query.trim().toLowerCase()
  return items.filter((item) => {
    const film = item.film_data || {}
    const nameRu = film.nameRu?.toLowerCase() || ""
    const nameEn = film.nameEn?.toLowerCase() || ""
    const nameOriginal = film.nameOriginal?.toLowerCase() || ""
    const description = film.description?.toLowerCase() || ""
    const shortDescription = film.shortDescription?.toLowerCase() || ""
    return (
      nameRu.includes(q) ||
      nameEn.includes(q) ||
      nameOriginal.includes(q) ||
      description.includes(q) ||
      shortDescription.includes(q)
    )
  })
}
