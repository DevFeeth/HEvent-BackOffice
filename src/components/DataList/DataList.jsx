import SearchInput from '@/components/SearchInput/SearchInput.jsx';
import DataTable from '@/components/DataTable/DataTable.jsx';
import Pagination from '@/components/Pagination/Pagination.jsx';
import {plural} from '@/utils/format.js';
import styles from './DataList.module.css';

export default function DataList({controls, itemWord, filters, children, ...tableProps}) {
    const {search, setSearch, filtered, visible, start, page, pageCount, setPage} = controls;
    const total = filtered.length;

    const range = total === 0
        ? `0 ${itemWord}`
        : `${start + 1}-${start + visible.length} sur ${plural(total, itemWord)}`;

    return (
        <section className={styles.card}>
            <div className={styles.toolbar}>
                <div className={styles.toolbarStart}>
                    <SearchInput value={search} onChange={setSearch}/>
                    {filters}
                </div>
                <span className={styles.total}>{plural(total, itemWord)}</span>
            </div>

            {children}

            <DataTable rows={visible} {...tableProps}/>

            <div className={styles.footer}>
                <span>{range}</span>
                <Pagination page={page} pageCount={pageCount} onChange={setPage}/>
            </div>
        </section>
    );
}
