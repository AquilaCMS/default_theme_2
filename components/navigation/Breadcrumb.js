import Link                 from 'next/link';
import { BreadcrumbJsonLd } from 'next-seo';

export default function Breadcrumb({ items }) {
    if(items?.length > 0) {
        return (
            <div className="container-ariane w-container">
                {items.map((itemChild, index) => {
                    return (
                        itemChild?.item && 
                            <Link href={itemChild.item} key={index}>
                                <a className="link-ariane-2">&gt; {itemChild.name}</a>
                            </Link>
                    );
                })}
                <BreadcrumbJsonLd itemListElements={items} />
            </div>
        );
    }
    else return null;
}