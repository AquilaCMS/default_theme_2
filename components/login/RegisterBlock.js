import { useState }   from 'react';
import { useRouter }  from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import Button         from '@components/ui/Button';
import { auth }       from 'aquila-connector/api/login';
import { setUser }    from 'aquila-connector/api/user';

export default function RegisterBlock() {
    const [messageRegister, setMessageRegister] = useState();
    const [isLoading, setIsLoading]             = useState(false);
    const router                                = useRouter();
    const { t }                                 = useTranslation();
    const redirect                              = router?.query?.redirect || '/account/informations';

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Get form data
        const user = {
            firstname   : e.currentTarget.firstname.value,
            lastname    : e.currentTarget.lastname.value,
            email       : e.currentTarget.email.value,
            password    : e.currentTarget.password.value,
            phone_mobile: e.currentTarget.phone_mobile.value
        };
        try {
            await setUser(user);
            await auth(user.email, user.password);
            router.push(redirect);
        } catch (err) {
            setMessageRegister({ type: 'error', message: err.message || t('common:message.unknownError') });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="col-log-int w-col w-col-5" onSubmit={handleRegisterSubmit}>
            <div className="log-label">{t('components/login/registerBlock:title')}</div>
            <div className="w-form">
                <div>
                    <div><input type="text" className="w-input" maxLength={256} name="firstname" placeholder={t('components/login/registerBlock:firstname')} required /></div>
                    <div><input type="text" className="w-input" maxLength={256} name="lastname" placeholder={t('components/login/registerBlock:name')} required /></div>
                    <div><input type="email" className="w-input" maxLength={256} name="email" placeholder={t('components/login/registerBlock:email')} required /></div>
                    <div><input type="password" className="w-input" maxLength={256} name="password" placeholder={t('components/login/registerBlock:password')} required /></div>
                    <div><input type="text" className="w-input" maxLength={256} name="phone_mobile" placeholder={t('components/login/registerBlock:phone')} required /></div>
                </div>
            </div>
            {
                messageRegister && (
                    <div className={`w-commerce-commerce${messageRegister.type}`}>
                        <div>
                            {messageRegister.message}
                        </div>
                    </div>
                )
            }
            <Button text={t('components/login/registerBlock:register')} loadingText={t('components/login/registerBlock:registerLoading')} isLoading={isLoading} className="log-button w-button" />
        </form>
    );
}