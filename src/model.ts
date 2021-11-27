
export interface SizeSpec {
    name: string
    width: number
    height: number

    subheader?: ImageSpec
    picture?: ImageSpec
    logo?: ImageSpec
    website?: TextSpec
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
    backgrounds: BackgroundSpec[]
    sizes: SizeSpec[]
}
