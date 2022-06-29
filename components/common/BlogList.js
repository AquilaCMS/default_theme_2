import parse                from 'html-react-parser';
import Link                 from 'next/link';
import useTranslation       from 'next-translate/useTranslation';
import { useComponentData } from '@lib/hooks';
import { formatDate }       from '@lib/utils';



export default function BlogList({ list = [] }) {
    const componentData = useComponentData();
    const { lang, t }   = useTranslation();

    // Get data in redux store or prop list 
    let blogList = componentData['nsBlogList'] || list;
    console.log(blogList);
    if (!blogList?.length) {
        return <div className="w-dyn-empty">
            <div>{t('components/blogList:noArticle')}</div>
        </div>;
    }

    return (
        <div className="content-section">
            <div className="blog-container">
                {blogList.map((article) => (
                    <div key={article._id} className="blog-card" style={{ width: '26%', display: 'flex', flexDirection: 'column' }}>
                        <img src={`/images/blog/578x266-80-crop-center/${article._id}/${article.slug[lang]}${article.extension}`} alt={article.title} className="blog-thumbnail" loading="lazy" />
                        <div style={{ height: '100%' }}>
                            <div className="blog-card-content">
                                <div className="blog-title-wrap">
                                    <h2 className="blog-title" style={{ marginBottom: '0px' }}>{article.title}</h2>
                                </div>
                                <p className="blog-date" style={{ fontStyle: 'italic' }}>{formatDate(article.createdAt, lang, { hour: '2-digit', minute: '2-digit', weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                <p className="paragraph">{parse(article.content.resume.slice(0, 80))}[...]</p>
                            
                                <form className="w-commerce-commerceaddtocartform default-state">
                                    <Link href={`/blog/${article.slug[lang]}`}><a><button type="submit" className="w-commerce-commerceaddtocartbutton order-button" style={{ alignItems: 'center' }}>Lire plus</button></a></Link>
                                </form>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {blogList.length > 2 &&
            parse(`<div className="blog-see-more">
                <button className="tab-link-round w-inline-block w-tab-link">Voir plus</button>
            </div>`)
            }

            
        </div>
    );
}