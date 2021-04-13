import { useState }       from 'react';
import Head               from 'next/head';
import Router             from 'next/router';
import Layout             from '@components/layouts/Layout';
import { resetPassword }  from '@lib/aquila-connector/user';
import { serverRedirect } from '@lib/utils';
import { dispatcher }     from '@lib/redux/dispatcher';


export async function getServerSideProps({ query, req, res }) {
    try {
        const data = await resetPassword(query.token);
        if (data.message === 'Token invalide') {
            return serverRedirect('/');
        }
    } catch (err) {
        return serverRedirect('/');
    }
    

    const pageProps       = await dispatcher(req, res);
    pageProps.props.token = query.token;
    return pageProps;
}


export default function ResetPassword({ token }) {
    const [messageReset, setMessageReset] = useState();

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        const password      = e.currentTarget.password.value;
        const passwordCheck = e.currentTarget.passwordCheck.value;
        
        if (password !== passwordCheck) {
            return setMessageReset({ type: 'error', message: 'Les mots de passe ne correspondent pas !' });
        }

        // Reset du mot de passe
        try {
            await resetPassword(token, password);
            Router.push('/account/login');
        } catch (err) {
            setMessageReset({ type: 'error', message: err.message });
        }
    };

    return (
        <Layout>
            <Head>
                <title>Récupération du mot de passe</title>
                <meta name="description" content="TODO" />
            </Head>
            <div className="header-section-panier">
                <div className="container-flex-2">
                    <div className="title-wrap-centre">
                        <h1 className="header-h1">Récupération du mot de passe</h1>
                    </div>
                </div>
            </div>
            <div className="section-tunnel">
                <div className="container-tunnel">
                    <div className="col-log w-row">

                        <div className="w-col w-col-3" />

                        <form className="col-log-int w-col w-col-6" onSubmit={handlePasswordSubmit}>
                            <div className="log-label">Entrez votre nouveau mot de passe</div>
                            <div className="w-form">
                                <div>
                                    <div><input type="password" className="w-input" maxLength={256} name="password" placeholder="Mot de passe" required /></div>
                                    <div><input type="password" className="w-input" maxLength={256} name="passwordCheck" placeholder="Mot de passe (confirmation)" required /></div>
                                </div>
                            </div>
                            {
                                messageReset && (
                                    <div className={`w-commerce-commerce${messageReset.type}`}>
                                        <div>
                                            {messageReset.message}
                                        </div>
                                    </div>
                                )
                            }
                            
                            <button type="submit" className="log-button w-button">ENVOYER</button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
