
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

export const DEMO_CAMPAIGN: Campaign = {
    assetPath: "images",
    backgrounds: [
        {name: "Boundaries", color: "#ffbd59"},
        {name: "Deserve", color: "#f36e80"},
        {name: "Difference", color: "#4ea23e"},
        {name: "Experience", color: "#9d7bd9"},
        {name: "Gentle", color: "#ccb4ae"},
        {name: "Pace", color: "#64cca3"},
        {name: "Progress", color: "#f7e367"},
        {name: "Resilient", color: "#b1a1fa"},
        {name: "Valid", color: "#7acbef"},
        {name: "Worthy", color: "#f09333"},
    ],
    sizes: [
        {
            name: "11x14",
            width: 1571,
            height: 2000,
            subheader: {
                x: 0,
                y: 355,
                width: 1571,
                height: 1645,
                horizontalAlignment: 'center',
                verticalAlignment: 'top',
            },
            picture: {
                x: 0,
                y: 590,
                width: 1571,
                height: 1235,
                horizontalAlignment: 'center',
            },
            logo: {
                x: 1396,
                y: 1825,
                width: 175,
                height: 175,
                horizontalAlignment: 'right',
            },
            website: {
                x: 1571,
                y: 0,
                horizontalAlignment: 'right',
                verticalAlignment: 'top',
                includeBackgroundFill: true,
            },
            programInfo: {
                x: 698,
                y: 1902,
                horizontalAlignment: 'center',
                verticalAlignment: 'center',
                lineDistribution: 'center',
            },
        },
        {
            name: "Square",
            width: 1571,
            height: 1571,
            subheader: {
                x: 0,
                y: 355,
                width: 1571,
                height: 1216,
                horizontalAlignment: 'center',
                verticalAlignment: 'top',
            },
            picture: {
                x: 0,
                y: 590,
                width: 1571,
                height: 806,
                horizontalAlignment: 'center',
            },
            logo: {
                x: 1396,
                y: 1396,
                width: 175,
                height: 175,
                horizontalAlignment: 'right',
            },
            website: {
                x: 1571,
                y: 0,
                horizontalAlignment: 'right',
                verticalAlignment: 'top',
                includeBackgroundFill: true,
            },
            programInfo: {
                x: 698,
                y: 1473,
                horizontalAlignment: 'center',
                verticalAlignment: 'center',
                lineDistribution: 'center',
            },
        },
        {
            name: "4x6",
            width: 1571,
            height: 1047,
            subheader: {
                x: 0,
                y: 355,
                width: 1571,
                height: 692,
                horizontalAlignment: 'center',
                verticalAlignment: 'top',
            },
            picture: {
                x: 0,
                y: 590,
                width: 1571,
                height: 282,
                horizontalAlignment: 'center',
            },
            logo: {
                x: 1396,
                y: 872,
                width: 175,
                height: 175,
                horizontalAlignment: 'right',
            },
            website: {
                x: 1571,
                y: 0,
                horizontalAlignment: 'right',
                verticalAlignment: 'top',
                includeBackgroundFill: true,
            },
            programInfo: {
                x: 698,
                y: 949,
                horizontalAlignment: 'center',
                verticalAlignment: 'center',
                lineDistribution: 'center',
            },
        },
    ]
}
