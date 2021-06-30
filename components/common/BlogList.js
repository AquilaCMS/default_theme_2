import useTranslation       from 'next-translate/useTranslation';
import { useComponentData } from '@lib/hooks';
import { formatDate }       from '@lib/utils';

export default function BlogList({ list = [] }) {
    const componentData = useComponentData();
    const { lang, t }   = useTranslation();

    // Get data in redux store or prop list
    let blogList = componentData['nsBlogList'] || list;
    
    if (!blogList?.length) {
        return <div className="w-dyn-empty">
            <div>{t('components/blogList:noArticle')}</div>
        </div>;
    }

    return (
        <div className="content-section">
            <div className="container">
                {blogList.map((item) => (
                    <div key={item._id} className="w-layout-grid content-grid" itemType="http://schema.org/Article">
                        <div className="content-block">
                            <h2 className="heading-5">{item.title}</h2>
                            <p>{formatDate(item.createdAt, lang, { hour: '2-digit', minute: '2-digit', weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                            <div dangerouslySetInnerHTML={{ __html: item.content.text }}></div>
                        </div>
                        <div className="image-block">
                            <img src={`${process.env.NEXT_PUBLIC_IMG_URL}/images/blog/578x266/${item._id}/${item.slug[lang]}${item.extension}`} alt={item.title} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}