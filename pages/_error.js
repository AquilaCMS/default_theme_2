import Head   from 'next/head';
import Layout from '@components/layouts/Layout';

function Error({ statusCode }) {

    const title = statusCode === 404 ? '404 - Page introuvable' : 'Oups...';
    const text  = statusCode === 404 ? 'La page que vous cherchez est introuvable' : (statusCode
        ? `An error ${statusCode} occurred on server`
        : 'An error occurred on client');

    return (
        <Layout>
            <Head>
                <title>{title}</title>
            </Head>
            <div className="utility-page-wrap-2">
                <div className="container flex-vertical">
                    <img src="/images/food-photographer-david-fedulov-X92WLoaQ1_o-unsplash.jpg" width={500} alt="" className="utility-image" />
                    <h2>{title}</h2>
                    <div>
                        <p className="utility-paragraph">{text}<br />
                            <a href="/" className="link-2">Retourner sur le site !</a>
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

Error.getInitialProps = ({ res, err }) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
};

export default Error;