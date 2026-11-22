import ReferenceManager from '@/components/ReferenceManager/ReferenceManager.jsx';
import useAdminLayout from '@/hooks/useAdminLayout.js';
import {addCategory, deleteCategory, getCategories, updateCategory} from '@/api/categories.js';
import {getEvents} from '@/api/events.js';
import {plural} from '@/utils/format.js';

// Catégories + nombre d'événements qui les utilisent
async function fetchCategories() {
    const [categories, events] = await Promise.all([getCategories(), getEvents()]);
    return categories.map((category) => ({
        ...category,
        usage: events.filter((event) => event.category_name === category.name).length,
    }));
}

// Une catégorie utilisée par des événements ne peut pas être supprimée
const getLockReason = (category) =>
    category.usage > 0 ? `Utilisée par ${plural(category.usage, 'événement')}` : null;

export default function CategoriesPage() {
    const {refreshCounts} = useAdminLayout();

    return (
        <ReferenceManager
            title="Catégories"
            addLabel="+ Ajouter une catégorie"
            itemWord="catégorie"
            usageHeader="Événements"
            fetchItems={fetchCategories}
            onCreate={addCategory}
            onUpdate={updateCategory}
            onDelete={deleteCategory}
            getLockReason={getLockReason}
            onChanged={refreshCounts}
        />
    );
}
