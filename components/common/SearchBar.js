import { useRouter }  from 'next/router';
import useTranslation from 'next-translate/useTranslation';

export default function SearchBar() {
    const router = useRouter();
    const { t }  = useTranslation();

    const handleSearch = async (e) => {
        e.preventDefault();
        const search = e.currentTarget.search.value.trim();
        if (search) {
            router.push(`/search/${encodeURIComponent(search)}`);
        }
    };

    const search = router.query.search;

    return (
        <div className="container-newsletter">
            <div className="w-form">
                <form className="form-3" onSubmit={handleSearch}>
                    <input type="text" className="text-field-2 w-input" name="search" maxLength="256" defaultValue={search} />
                    <button type="submit" className="submit-button-newsletter w-button">{t('components/searchBar:submit')}</button>
                </form>
            </div>
        </div>
    );
}