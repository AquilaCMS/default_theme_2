import { useEffect, useRef, useState } from 'react';
import useTranslation                  from 'next-translate/useTranslation';
import Button                          from '@components/ui/Button';
import { setContact }                  from '@lib/aquila-connector/contact';

export default function Contact({ classdiv, classinput, 'button-title': value, mode = 'send' }) {
    const divRef                    = useRef();
    const [message, setMessage]     = useState();
    const [isLoading, setIsLoading] = useState(false);
    const { t }                     = useTranslation();

    useEffect(() => {
        let form = divRef.current;
        do { form = form.parentNode; } while (form.tagName !== 'FORM' && form.tagName !== 'HTML');
        form.onsubmit = onSubmitForm;
    }, []);

    const onSubmitForm = async (e) => {
        e.preventDefault();

        setIsLoading(true);
        const formdata = new FormData(e.target);
        try {
            await setContact(mode, formdata);
            setMessage({ type: 'info', message: t('components/contact:messageSuccess') });
        } catch(err) {
            setMessage({ type: 'error', message: err.message || t('common:message.unknownError') });
        } finally {
            setIsLoading(false);
        }
        
        let form = divRef.current;
        do { form = form.parentNode; } while (form.tagName !== 'FORM' && form.tagName !== 'HTML');
        form.reset();
    };

    return (
        <div ref={divRef} className={classdiv}>
            <Button 
                text={value}
                loadingText={t('components/contact:submitLoading')}
                isLoading={isLoading}
                className={classinput}
            />
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
    );
}