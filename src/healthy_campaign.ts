import {Campaign} from "./model";

export const HEALTHY_CAMPAIGN: Campaign = {
    assetPath: "healthy",
    assetPaths: {
        background: "{background}_{size}.png",
        header: "{background}_header_{language}.png",
        defaultPicture: "{background}_defaultpicture.png",
        antiDefaultPicture: "{background}_frame.png",
    },
    languages: ["English", "Spanish"],
    backgrounds: [
        {name: "Accountability", color: "#fdedd6"},
        {name: "Boundaries", color: "#ad89e1"},
        {name: "Consent", color: "#fdedd6"},
        {name: "Equality", color: "#5a7424"},
        {name: "Healthy Conflict", color: "#5a7424"},
        {name: "Honesty", color: "#42347b"},
        {name: "Independence", color: "#fde4d6"},
        {name: "Joy", color: "#fff9c7"},
        {name: "Respect", color: "#42347b"},
        {name: "Trust", color: "#2c5996"},
    ],
    sizes: [
        {
            name: "8.5x11",
            label: "8.5x11",
            width: 1545,
            height: 2000,
            header: {
                x: 0,
                y: 96,
                width: 1545,
                height: 1904,
                horizontalAlignment: 'center',
                verticalAlignment: 'top',
            },
            defaultPicture: {
                x: 34,
                y: 34,
                width: 1476,
                height: 1807,
                horizontalAlignment: 'center',
                verticalAlignment: 'bottom',
                scaleStrategy: 'fill',
            },
            antiDefaultPicture: {
                x: 34,
                y: 34,
                width: 1476,
                height: 1807,
                horizontalAlignment: 'center',
                verticalAlignment: 'bottom',
                scaleStrategy: 'fill',
            },
            picture: {
                x: 314,
                y: 556,
                width: 926,
                height: 1070,
                enforceAspectRatio: true,
            },
            logo: {
                x: 1323,
                y: 1653,
                width: 188,
                height: 188,
                horizontalAlignment: 'right',
            },
            website: {
                x: 1545,
                y: 0,
                horizontalAlignment: 'right',
                verticalAlignment: 'top',
                includeBackgroundFill: true,
            },
            programInfo: {
                x: 772,
                y: 1910,
                horizontalAlignment: 'center',
                verticalAlignment: 'center',
                lineDistribution: 'center',
            },
        },
        {
            name: "11x17",
            label: "11x17",
            width: 1294,
            height: 2000,
            header: {
                x: 0,
                y: 96,
                width: 1294,
                height: 1904,
                horizontalAlignment: 'center',
                verticalAlignment: 'top',
            },
            defaultPicture: {
                x: 29,
                y: 29,
                width: 1236,
                height: 1838,
                horizontalAlignment: 'center',
                verticalAlignment: 'bottom',
                scaleStrategy: 'fill',
            },
            antiDefaultPicture: {
                x: 29,
                y: 29,
                width: 1236,
                height: 1838,
                horizontalAlignment: 'center',
                verticalAlignment: 'bottom',
                scaleStrategy: 'fill',
            },
            picture: {
                x: 199,
                y: 610,
                width: 906,
                height: 1047,
                enforceAspectRatio: true,
            },
            logo: {
                x: 1078,
                y: 1680,
                width: 187,
                height: 187,
                horizontalAlignment: 'right',
            },
            website: {
                x: 1294,
                y: 0,
                horizontalAlignment: 'right',
                verticalAlignment: 'top',
                includeBackgroundFill: true,
            },
            programInfo: {
                x: 647,
                y: 1923,
                horizontalAlignment: 'center',
                verticalAlignment: 'center',
                lineDistribution: 'center',
            },
        },
        {
            name: "12x18",
            label: "12x18",
            width: 1333,
            height: 2000,
            header: {
                x: 0,
                y: 96,
                width: 1333,
                height: 1904,
                horizontalAlignment: 'center',
                verticalAlignment: 'top',
            },
            defaultPicture: {
                x: 29,
                y: 29,
                width: 1275,
                height: 1838,
                horizontalAlignment: 'center',
                verticalAlignment: 'bottom',
                scaleStrategy: 'fill',
            },
            antiDefaultPicture: {
                x: 29,
                y: 29,
                width: 1275,
                height: 1838,
                horizontalAlignment: 'center',
                verticalAlignment: 'bottom',
                scaleStrategy: 'fill',
            },
            picture: {
                x: 219,
                y: 610,
                width: 906,
                height: 1047,
                enforceAspectRatio: true,
            },
            logo: {
                x: 1142,
                y: 1705,
                width: 162,
                height: 162,
                horizontalAlignment: 'right',
            },
            website: {
                x: 1333,
                y: 0,
                horizontalAlignment: 'right',
                verticalAlignment: 'top',
                includeBackgroundFill: true,
            },
            programInfo: {
                x: 666,
                y: 1923,
                horizontalAlignment: 'center',
                verticalAlignment: 'center',
                lineDistribution: 'center',
            },
        },
        {
            name: "square",
            label: "Social Media",
            width: 1080,
            height: 1080,
            header: {
                assetPath: '{background}_header_{language}_square.png',
                x: 16,
                y: 52,
                width: 1048,
                height: 200,
                horizontalAlignment: 'center',
                verticalAlignment: 'top',
            },
            defaultPicture: {
                assetPath: '{background}_defaultpicture_square.png',
                x: 16,
                y: 16,
                width: 1048,
                height: 992,
                horizontalAlignment: 'center',
                verticalAlignment: 'bottom',
                scaleStrategy: 'fill',
            },
            antiDefaultPicture: {
                assetPath: '{background}_frame_square.png',
                x: 16,
                y: 16,
                width: 1048,
                height: 992,
                horizontalAlignment: 'center',
                verticalAlignment: 'bottom',
                scaleStrategy: 'fill',
            },
            picture: {
                x: 272,
                y: 353,
                width: 537,
                height: 598,
                enforceAspectRatio: true,
            },
            logo: {
                x: 933,
                y: 877,
                width: 131,
                height: 131,
                horizontalAlignment: 'right',
            },
            website: {
                x: 1080,
                y: 0,
                horizontalAlignment: 'right',
                verticalAlignment: 'top',
                includeBackgroundFill: true,
            },
            programInfo: {
                x: 540,
                y: 1034,
                horizontalAlignment: 'center',
                verticalAlignment: 'center',
                lineDistribution: 'center',
            },
        },
    ]
}
