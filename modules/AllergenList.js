import { useProduct } from '@lib/hooks';

export default function AllergenList() {
    const product = useProduct();

    return (
        <table>
            {
                product.allergens.map((allergen) => {
                    return (
                        <tr key={allergen._id}>
                            <td style={{ padding: '10px' }}>
                                <img src={allergen.image} alt={allergen.code} />
                            </td>
                            <td style={{ padding: '10px' }}>{allergen.name}</td>
                        </tr>
                    );
                })
            }    
        </table>
    );
}