import ReferenceManager from '@/components/ReferenceManager/ReferenceManager.jsx';
import useAdminLayout from '@/hooks/useAdminLayout.js';
import {addCategory, deleteCategory, getCategories, updateCategory} from '@/api/categories.js';
import {plural} from '@/utils/format.js';

const getLockReason = (category) =>
    category.event_count > 0 ? `Utilisée par ${plural(category.event_count, 'événement')}` : null;

export default function CategoriesPage() {
    const {refreshCounts} = useAdminLayout();

    return (
        <ReferenceManager
            title="Catégories"
            addLabel="+ Ajouter une catégorie"
            itemWord="catégorie"
            usageHeader="Événements"
            usageKey="event_count"
            fetchPage={getCategories}
            onCreate={addCategory}
            onUpdate={updateCategory}
            onDelete={deleteCategory}
            getLockReason={getLockReason}
            onChanged={refreshCounts}
        />
    );
}
