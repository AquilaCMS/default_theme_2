import parse             from 'html-react-parser';
import absoluteUrl       from 'next-absolute-url';
import useTranslation    from 'next-translate/useTranslation';
import Breadcrumb        from '@components/navigation/Breadcrumb';
import Layout            from '@components/layouts/Layout';
import BlockCMS          from '@components/common/BlockCMS';
import { getBlogList }   from '@aquilacms/aquila-connector/api/blog';
import { getBreadcrumb } from '@aquilacms/aquila-connector/api/breadcrumb';
import { dispatcher }    from '@lib/redux/dispatcher';
import { initAxios }     from '@lib/utils';
import { formatDate }    from '@lib/utils';
import getT              from 'next-translate/getT';
import Link              from 'next/link';


export async function getServerSideProps({ defaultLocale, locale, params, req, res, resolvedUrl }) {
    initAxios(locale, req, res);

    let blogArticle = {};
    try {
        const blogList = await getBlogList({}, locale);
        
        blogArticle = blogList.find(item => item.slug[locale] === params.article);
    } catch (err) {
        return { notFound: true };
    }

    let breadcrumb = [];
    try {
        breadcrumb = await getBreadcrumb(`${defaultLocale !== locale ? `/${locale}` : ''}${resolvedUrl}`);
    } catch (err) {
        const t = await getT(locale, 'common');
        console.error(err.message || t('common:message.unknownError'));
    }

    // Get URLs for language change
    // const urlsLanguages = [];
    // if (staticPage) {
    //     for (const [lang, sl] of Object.entries(staticPage.slug)) {
    //         urlsLanguages.push({ lang, url: `/${sl}` });
    //     }
    // }

    const actions = [
        // {
        //     type: 'PUSH_CMSBLOCKS',
        //     func: getBlocksCMS.bind(this, ['bottom-parallax'], locale)
        // }, {
        //     type : 'SET_STATICPAGE',
        //     value: staticPage
        // }, {
        //     type : 'SET_URLS_LANGUAGES',
        //     value: urlsLanguages
        // }
    ];

    const pageProps = await dispatcher(locale, req, res, actions);

    // URL origin
    const { origin }            = absoluteUrl(req);
    pageProps.props.origin      = origin;
    pageProps.props.blogArticle = blogArticle;
    pageProps.props.breadcrumb  = breadcrumb;
    return pageProps;
}

export default function BlogArticle({ blogArticle, breadcrumb, origin }) {
    const { lang } = useTranslation();

    return (
        <Layout>
            <div className="header-section-carte" style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.59), rgba(250, 140, 78, 0.72)), url('+`/images/blog/1920x266-100-crop-center/${blogArticle._id}/${blogArticle.slug[lang]}${blogArticle.extension}`+')' }}>
                <div className="container-flex-2">
                    <div className="title-wrap-centre">
                        <h1 className="header-h1"><span className="brand-span">{blogArticle.title}</span></h1>
                    </div>
                </div>
            </div>

            <div className="content-section-short-product">
                <Breadcrumb items={breadcrumb} origin={origin} />
                <div className="container-flex-2">
                    <div className="container w-container">
                        <h3>{blogArticle.title}</h3>
                        <p className="blog-date" style={{ fontStyle: 'italic' }}>Le {formatDate(blogArticle.createdAt, lang, { hour: '2-digit', minute: '2-digit', weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                        <div style={{ borderTop: '2px solid #ff8946', paddingTop: '15px', borderBottom: '2px solid #ff8946' }}>{parse(blogArticle.content.text)}</div>
                        <Link href='/blog'>
                            <a>
                                <button type="button" className="button bottomspace w-button" style={{ marginTop: '60px' }}>Retour</button>
                            </a>
                        </Link>
                    </div> 
                    
                </div>
               
            </div>

            <BlockCMS nsCode="info-bottom-1" /> {/* TODO : il faudrait afficher le contenu d'une description de la catégorie rattachée ! */}
        </Layout>
    );
}