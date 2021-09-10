import Link           from 'next/link';
import { useRouter }  from 'next/router';
import useTranslation from 'next-translate/useTranslation';

export default function CategoryCard({ item }) {
    const { asPath }  = useRouter();
    const { lang, t } = useTranslation();

    if (!item) {
        return <div className="w-dyn-empty">{t('components/category:categoryCard.noCategory')}</div>;
    }

    return (
        <div role="listitem" className="menu-item w-dyn-item w-col w-col-2">
            <div>
                <Link href={`${asPath}/${item.slug[lang]}`}>
                    <a className="food-image-square w-inline-block">
                        <img src={item.img ? `/${item.img}` : '/images/no-image.svg'} alt={item.name} className="food-image" loading="lazy" />
                    </a>
                </Link>
                <div className="food-card-content">
                    <Link href={`${asPath}/${item.slug[lang]}`}>
                        <a>{item.name}</a>
                    </Link>
                </div>
            </div>
        </div>
    );
}