
export function getImage(image, size) {
    size = size || '256x256';
    if (image) {
        return `${process.env.NEXT_PUBLIC_IMG_URL}/images/products/${size}/${image._id}/${image.name}`;
    }
    return '';
}

export function getMainImage(images, size) {
    size = size || '256x256';
    if (images && images[0]) {
        let image = images.find(ou => ou.default); // Get default image
        if(!image) { // No default ?
            image = images[0]; // Take first image
        }
        return `${process.env.NEXT_PUBLIC_IMG_URL}/images/products/${size}/${image._id}/${image.name}`;
    }
    return '';
}

export function getTabImageURL(images) {
    const size    = 'max-100';
    let imagesTab = [];

    for (let index = 0; index < images?.length; index++) {
        const image = images[index];
        imagesTab.push(`${process.env.NEXT_PUBLIC_IMG_URL}/images/products/${size}/${image._id}/${image.name}`);
    }

    return imagesTab;
}

export function generateSlug({ slug/* , categorySlugs, canonical */ }) {
    return '/p/' + slug;
    /*if (categorySlugs) {
        return `/${categorySlugs.join('/')}/${slug}`;
    } else if (canonical) {
        return canonical;
    }
    return '/404';*/
}