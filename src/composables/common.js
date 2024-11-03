export const getRandStr =
    (num) => {
        const characters =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < num; i++) {
            result +=
                characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    }

export const getRandNum = (min, max) => { 
    return Math.floor(Math.random() * (max - min + 1)) + min;
}