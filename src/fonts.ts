
export const FONTS = [
    'Advent Pro', 'Bebas Neue', 'Caveat', 'Dancing Script', 'Gluten', 'Gruppo', 'Indie Flower', 'Kalam', 'Outfit', 'Pacifico', 'Questrial', 'Quicksand', 'Rampart One', 'Red Hat Display', 'Rock Salt', 'Shalimar'
];

let fontMap: {[key: string]: string} = {
    "Advent Pro": "https://fonts.gstatic.com/s/adventpro/v11/V8mAoQfxVT4Dvddr_yOwhTqtLQ.ttf",
    "Bebas Neue": "https://fonts.gstatic.com/s/bebasneue/v2/JTUSjIg69CK48gW7PXoo9Wlhzg.ttf",
    "Caveat": "https://fonts.gstatic.com/s/caveat/v10/WnznHAc5bAfYB2QRah7pcpNvOx-pjfJ9eIWpZA.ttf",
    "Dancing Script": "https://fonts.gstatic.com/s/dancingscript/v19/If2cXTr6YS-zF4S-kcSWSVi_sxjsohD9F50Ruu7BMSo3Sup5.ttf",
    "Gluten": "https://fonts.gstatic.com/s/gluten/v1/HhyIU5gk9fW7OUdVIPh2wBPxSqQJ_zh2zDQhRg.ttf",
    "Gruppo": "https://fonts.gstatic.com/s/gruppo/v11/WwkfxPmzE06v_ZW1XnrE.ttf",
    "Indie Flower": "https://fonts.gstatic.com/s/indieflower/v12/m8JVjfNVeKWVnh3QMuKkFcZVaUuC.ttf",
    "Kalam": "https://fonts.gstatic.com/s/kalam/v11/YA9dr0Wd4kDdMthROCI.ttf",
    "Outfit": "https://fonts.gstatic.com/s/outfit/v1/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1O4a0Fg.ttf",
    "Pacifico": "https://fonts.gstatic.com/s/pacifico/v17/FwZY7-Qmy14u9lezJ-6H6Mw.ttf",
    "Questrial": "https://fonts.gstatic.com/s/questrial/v13/QdVUSTchPBm7nuUeVf70viFg.ttf",
    "Quicksand": "https://fonts.gstatic.com/s/quicksand/v24/6xK-dSZaM9iE8KbpRA_LJ3z8mH9BOJvgkP8o58a-xw.ttf",
    "Rampart One": "https://fonts.gstatic.com/s/rampartone/v1/K2F1fZFGl_JSR1tAWNG9R5qnJyo.ttf",
    "Red Hat Display": "https://fonts.gstatic.com/s/redhatdisplay/v7/8vIf7wUr0m80wwYf0QCXZzYzUoTK8RZQvRd-D1NYbmyWQk8z_Q.ttf",
    "Rock Salt": "https://fonts.gstatic.com/s/rocksalt/v11/MwQ0bhv11fWD6QsAVOZrt0M_.ttf",
    "Shalimar": "https://fonts.gstatic.com/s/shalimar/v1/uU9MCBoE6I6iNWFUvQP2-vQ.ttf",
}
let fontCache: {[key: string]: Promise<ArrayBuffer>} = {};
export function fetchFontTtf(name: string): Promise<ArrayBuffer> {
    let val = fontCache[name];
    if (val) {
        return val;
    }

    let url = fontMap[name];
    if (!url) {
        return Promise.reject(new Error("Unsupported font family: " + name));
    }
    let promise = fetch(url)
        .then(res => {
            if (res.status !== 200) {
                throw new Error("Bad response code: " + res.status);
            }
            return res.blob();
        }).then(blob => {
            return blob.arrayBuffer()
        });
    fontCache[name] = promise;
    return promise;
}
