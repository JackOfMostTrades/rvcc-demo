import {Campaign} from "./model";

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
        }
    ]
}
