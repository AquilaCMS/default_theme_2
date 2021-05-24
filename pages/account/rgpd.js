import { useState }                                       from 'react';
import Head                                               from 'next/head';
import { useRouter }                                      from 'next/router';
import useTranslation                                     from 'next-translate/useTranslation';
import { Modal }                                          from 'react-responsive-modal';
import AccountLayout                                      from '@components/account/AccountLayout';
import { dataUserExport, anonymizeUser, deleteUser }      from '@lib/aquila-connector/user';
import { authProtectedPage, serverRedirect, unsetCookie } from '@lib/utils';
import { dispatcher }                                     from '@lib/redux/dispatcher';

import 'react-responsive-modal/styles.css';

export async function getServerSideProps({ req, res }) {
    const user = await authProtectedPage(req.headers.cookie);
    if (!user) {
        return serverRedirect('/account/login?redirect=' + encodeURI('/account/informations'));
    }
    const pageProps      = await dispatcher(req, res);
    pageProps.props.user = user;
    return pageProps;
}

export default function Rgpd({ user }) {
    const [modalMode, setModalMode] = useState(1);
    const [openModal, setOpenModal] = useState();
    const [message, setMessage]     = useState();
    const router                    = useRouter();
    const { t }                     = useTranslation();

    const exportData = async () => {
        try {
            const response = await dataUserExport(user._id);
            const url      = window.URL.createObjectURL(new Blob([response.data]));
            const link     = document.createElement('a');
            link.href      = url;
            link.setAttribute('download', 'dataExport.txt');
            document.body.appendChild(link);
            link.click();
        } catch(err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
        }
    };

    const anonymiseData = async () => {
        try {
            await anonymizeUser(user._id);
            setOpenModal(false);

            // Logout
            unsetCookie('jwt');

            // Redirection to login
            router.push('/account/login');
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
        }
    };

    const deleteAccount = async () => {
        try {
            await deleteUser(user._id);
            setOpenModal(false);

            // Logout
            unsetCookie('jwt');

            // Redirection to login
            router.push('/account/login');
        } catch (err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
        }
    };

    const onOpenModal = (mode) => {
        setModalMode(mode);
        setOpenModal(true);
    };

    const onCloseModal = () => {
        setOpenModal(false);
    };

    return (
        <AccountLayout active="3">
            <Head>
                <title>{t('pages/account/rgpd:title')}</title>
            </Head>

            <div className="container-tunnel-01">
                <h2 className="heading-2-steps">{t('pages/account/rgpd:titleNav')}</h2>
            </div>
            <div className="container-account">
                <div className="div-block-tunnel w-form">
                    <div>
                        <button type="button" onClick={exportData} className="w-button">{t('pages/account/rgpd:buttonExportData')}</button>
                        <p>{t('pages/account/rgpd:labelExportData')}</p>
                    </div>
                    <div>
                        <button type="button" onClick={() => onOpenModal(1)} className="w-button">{t('pages/account/rgpd:buttonAnonymizedData')}</button>
                        <p>{t('pages/account/rgpd:labelAnonymizedData')}</p>
                    </div>
                    <div>
                        <button type="button" onClick={() => onOpenModal(2)} className="w-button">{t('pages/account/rgpd:buttonRemoveAccount')}</button>
                        <p>{t('pages/account/rgpd:labelRemoveAccount')}</p>
                    </div>
                    <Modal open={openModal} onClose={onCloseModal} center>
                        <h3>{t('pages/account/rgpd:modalTitle')}</h3>
                        <p>{t('pages/account/rgpd:modalWarning')}</p>
                        <div>
                            <button type="button" className="w-button" onClick={modalMode === 1 ? anonymiseData : deleteAccount}>
                                {t('pages/account/rgpd:yes')}
                            </button>
                            &nbsp;
                            <button type="button" className="w-button" onClick={onCloseModal}>
                                {t('pages/account/rgpd:no')}
                            </button>
                        </div>
                    </Modal>
                    {
                        message && (
                            <div className={`w-commerce-commerce${message.type}`}>
                                <div>
                                    {message.message}
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>


        </AccountLayout>
    );
}
