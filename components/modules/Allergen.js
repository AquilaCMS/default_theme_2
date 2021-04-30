import { useState } from 'react';

export default function Allergen() {
    const [open, setOpen] = useState(false);
    const openBlock       = () => {
        setOpen(!open);
    };

    return (


        <div className="div-block-allergenes">
            <div className="faq-question-wrap">
                <div className="lien_alergenes w-inline-block" onClick={openBlock}>
                    <h6 className="heading-6-center">
                        COCHEZ VOS ALLERGÈNES AFIN DE NE VOIR QUE LES PRODUITS QUE VOUS POUVEZ CONSOMMER
                    </h6>
                    <img src="/images/Plus.svg" alt="" className="plus" />
                </div>
                <div className={`faq-content${open ? ' faq-question-open' : ''}`}>
                    <div className="text-span-center">Passez obligatoirement une commande unique en cas d&apos;allergie afin que les produits soient isolés</div>
                    <div className="form-block w-form">
                        <form name="form-alergies" className="form alergies"><label className="w-checkbox checkbox-field-allergene">
                            <div className="w-checkbox-input w-checkbox-input--inputType-custom checkbox-allergene" /><input type="checkbox" id="Arachides" name="checkbox" style={{ opacity: 0, position: 'absolute', zIndex: -1 }} /><span className="checkbox-label-allergene w-form-label">Arachides</span>
                        </label><label className="w-checkbox checkbox-field-allergene">
                            <div className="w-checkbox-input w-checkbox-input--inputType-custom checkbox-allergene" /><input type="checkbox" id="Gluten" name="checkbox-2" style={{ opacity: 0, position: 'absolute', zIndex: -1 }} /><span className="checkbox-label-allergene w-form-label">Gluten</span>
                        </label><label className="w-checkbox checkbox-field-allergene">
                            <div className="w-checkbox-input w-checkbox-input--inputType-custom checkbox-allergene" /><input type="checkbox" id="Mollusque" name="checkbox-2" style={{ opacity: 0, position: 'absolute', zIndex: -1 }} /><span className="checkbox-label-allergene w-form-label">Mollusque</span>
                        </label><label className="w-checkbox checkbox-field-allergene">
                            <div className="w-checkbox-input w-checkbox-input--inputType-custom checkbox-allergene" /><input type="checkbox" id="Fruits-coques" name="checkbox-2" style={{ opacity: 0, position: 'absolute', zIndex: -1 }} /><span className="checkbox-label-allergene w-form-label">Fruits à coques</span>
                        </label><label className="w-checkbox checkbox-field-allergene">
                            <div className="w-checkbox-input w-checkbox-input--inputType-custom checkbox-allergene" /><input type="checkbox" id="Ma-s" name="checkbox-2" style={{ opacity: 0, position: 'absolute', zIndex: -1 }} /><span className="checkbox-label-allergene w-form-label">Maïs</span>
                        </label><label className="w-checkbox checkbox-field-allergene">
                            <div className="w-checkbox-input w-checkbox-input--inputType-custom checkbox-allergene" /><input type="checkbox" id="Poisson" name="checkbox-2" style={{ opacity: 0, position: 'absolute', zIndex: -1 }} /><span className="checkbox-label-allergene w-form-label">Poisson</span>
                        </label><label className="w-checkbox checkbox-field-allergene">
                            <div className="w-checkbox-input w-checkbox-input--inputType-custom checkbox-allergene" /><input type="checkbox" id="Lupins" name="checkbox-2" style={{ opacity: 0, position: 'absolute', zIndex: -1 }} /><span className="checkbox-label-allergene w-form-label">Lupins</span>
                        </label><label className="w-checkbox checkbox-field-allergene">
                            <div className="w-checkbox-input w-checkbox-input--inputType-custom checkbox-allergene" /><input type="checkbox" id="Oeufs" name="checkbox-2" style={{ opacity: 0, position: 'absolute', zIndex: -1 }} /><span className="checkbox-label-allergene w-form-label">Oeufs</span>
                        </label><label className="w-checkbox checkbox-field-allergene">
                            <div className="w-checkbox-input w-checkbox-input--inputType-custom checkbox-allergene" /><input type="checkbox" id="Sulfite" name="checkbox-2" style={{ opacity: 0, position: 'absolute', zIndex: -1 }} /><span className="checkbox-label-allergene w-form-label">Sulfite</span>
                        </label><label className="w-checkbox checkbox-field-allergene">
                            <div className="w-checkbox-input w-checkbox-input--inputType-custom checkbox-allergene" /><input type="checkbox" id="Moutarde" name="checkbox-2" style={{ opacity: 0, position: 'absolute', zIndex: -1 }} /><span className="checkbox-label-allergene w-form-label">Moutarde</span>
                        </label><label className="w-checkbox checkbox-field-allergene">
                            <div className="w-checkbox-input w-checkbox-input--inputType-custom checkbox-allergene" /><input type="checkbox" id="Soja" name="checkbox-2" style={{ opacity: 0, position: 'absolute', zIndex: -1 }} /><span className="checkbox-label-allergene w-form-label">Soja</span>
                        </label><label className="w-checkbox checkbox-field-allergene">
                            <div className="w-checkbox-input w-checkbox-input--inputType-custom checkbox-allergene" /><input type="checkbox" id="Sesame" name="checkbox-2" style={{ opacity: 0, position: 'absolute', zIndex: -1 }} /><span className="checkbox-label-allergene w-form-label">Sésame</span>
                        </label><label className="w-checkbox checkbox-field-allergene">
                            <div className="w-checkbox-input w-checkbox-input--inputType-custom checkbox-allergene" /><input type="checkbox" id="Crustac-s" name="checkbox-2" style={{ opacity: 0, position: 'absolute', zIndex: -1 }} /><span className="checkbox-label-allergene w-form-label">Crustacés</span>
                        </label><label className="w-checkbox checkbox-field-allergene">
                            <div className="w-checkbox-input w-checkbox-input--inputType-custom checkbox-allergene" /><input type="checkbox" id="Celeri" name="checkbox-2" style={{ opacity: 0, position: 'absolute', zIndex: -1 }} /><span className="checkbox-label-allergene w-form-label">Céleri</span>
                        </label><label className="w-checkbox checkbox-field-allergene">
                            <div className="w-checkbox-input w-checkbox-input--inputType-custom checkbox-allergene" /><input type="checkbox" id="Lait" name="checkbox-2" style={{ opacity: 0, position: 'absolute', zIndex: -1 }} /><span className="checkbox-label-allergene w-form-label">Lait</span>
                        </label></form>
                        <div className="w-form-done">
                            <div>Thank you! Your submission has been received!</div>
                        </div>
                        <div className="w-form-fail">
                            <div>Oops! Something went wrong while submitting the form.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>



    );
}