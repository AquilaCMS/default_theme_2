import useTranslation       from 'next-translate/useTranslation';
import moment               from 'moment';
import { useComponentData } from '@lib/hooks';

export default function BlogList({ list = [] }) {
    const componentData = useComponentData();
    const { lang, t }   = useTranslation();

    moment.locale(lang);

    // Get data in redux store or prop list
    const blogList = componentData['nsBlogList'] || list;

    return (
        <div className="content-section">
            <div className="container">
                {blogList.length ? blogList.map((item) => (
                    <div key={item._id} className="w-layout-grid content-grid" itemType="http://schema.org/Article">
                        <div className="content-block">
                            <h2 className="heading-5">{item.title}</h2>
                            <p>{moment(item.createdAt).format('LLL')}</p>
                            <div dangerouslySetInnerHTML={{ __html: item.content.text }}></div>
                        </div>
                        <div className="image-block">
                            <img src={`${process.env.NEXT_PUBLIC_IMG_URL}/images/blog/578x266/${item._id}/${item.slug[lang]}${item.extension}`} alt={item.title} />
                        </div>
                    </div>
                )) : (
                    <div className="w-dyn-empty">
                        <div>{t('components/blogList:noArticle')}</div>
                    </div>
                )}
            </div>
        </div>
    );
}