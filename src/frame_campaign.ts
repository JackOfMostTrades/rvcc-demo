import {Campaign} from "./model";

export const FRAME_CAMPAIGN: Campaign = {
    assetPath: "frame",
    assetPaths: {
        background: "{background}_{size}.png",
        foreground: "{background}_foreground.png",
        header: "{background}_header_{language}.png",
    },
    languages: ["English", "Spanish"],
    backgrounds: [
        {name: "Joy", color: "#7bc1eb"},
        {name: "Trust", color: "#a6d2f8"},
    ],
    sizes: [
        {
            name: "11x14",
            label: "11x14",
            width: 1571,
            height: 2000,
            header: {
                x: 0,
                y: 96,
                width: 1571,
                height: 1904,
                horizontalAlignment: 'center',
                verticalAlignment: 'top',
            },
            foreground: {
                x: 193,
                y: 501,
                width: 1206,
                height: 1339,
                horizontalAlignment: 'center',
                verticalAlignment: 'center',
            },
            picture: {
                x: 297,
                y: 600,
                width: 989,
                height: 1141,
                horizontalAlignment: 'center',
                verticalAlignment: 'center',
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
                x: 785,
                y: 1893,
                horizontalAlignment: 'center',
                verticalAlignment: 'center',
                lineDistribution: 'center',
            },
        },
    ]
}
