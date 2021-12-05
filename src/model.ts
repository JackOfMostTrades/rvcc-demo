export interface SizeSpec {
    name: string
    label: string
    width: number
    height: number

    // The header is always displayed, but the image source can vary based on language
    header?: ImageSpec
    // A default picture that will be displayed. The image source depends on background and language. It can be turned off in the form
    defaultPicture?: ImageSpec
    // A non-editable picture that gets displayed when defaultPicture is disabled in the form. This is used to include a subheader
    // containing text that is in the default picture. Image source can vary depending on language
    antiDefaultPicture?: ImageSpec
    // An image that will be rendered on top of all other images
    foreground?: ImageSpec

    // The user-uploaded picture that can be chosen if defaultPicture gets disabled.
    picture?: ImageSpec
    // The user-uploaded logo
    logo?: ImageSpec
    // User-specified website/social media text
    website?: TextSpec
    // User-specified program information text
    programInfo?: TextSpec
}

export interface BackgroundSpec {
    name: string
    color: string
}

export interface ImageSpec {
    x: number
    y: number
    width: number
    height: number

    // Defaults to "center"
    horizontalAlignment?: 'center' | 'left' | 'right'
    // Defaults to "center"
    verticalAlignment?: 'center' | 'top' | 'bottom'
    // Defaults to false
    includeBackgroundFill?: boolean
    // When scaling, should the image be filled to fit entirely within the rectangle ("fit") so that no cropping is
    // needed but there may be extra transparent space, or should it be scaled to completely fill the rectangle ("fill")
    // potentially cropping some of the image. Default is "fit".
    scaleStrategy?: 'fit' | 'fill'
    // For user-submitted images, should the image-cropping dialogue enforce the aspect ratio width/height? If so, the
    // scaleStrategy above is irrelevant since fit and fill will have the same result. This defaults to false.
    enforceAspectRatio?: boolean
}

export interface TextSpec {
    x: number
    y: number

    // Defaults to "left"
    horizontalAlignment?: 'left' | 'right' | 'center'
    // Does the y coordinate represent the top of the text, bottom, or center. Defaults to "top".
    verticalAlignment?: 'top' | 'bottom' | 'center'
    // If the text has multiple lines, how should lines be distributed? Defaults to "down".
    lineDistribution?: 'down' | 'up' | 'center'

    // Defaults to false
    includeBackgroundFill?: boolean
}

export interface Campaign {
    assetPath: string
    assetPaths?: {
        background?: string
        foreground?: string
        header?: string
        defaultPicture?: string
        antiDefaultPicture?: string
    }
    backgrounds: BackgroundSpec[]
    sizes: SizeSpec[]
    languages: string[]
}
