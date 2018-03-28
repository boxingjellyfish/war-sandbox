module.exports = Level = function () {

};

Level.prototype.createDefaultMap = function () {
    var map = {
        id: "default",
        regions: [
            {
                id: "n_america",
                territories: [
                    {
                        id: "alaska",
                        borders: [
                            { x: 11, y: 9 },
                            { x: 13, y: 8 },
                            { x: 13, y: 5 },
                            { x: 19, y: 2 },
                            { x: 19, y: 4 },
                            { x: 17, y: 5 },
                            { x: 17, y: 10 },
                            { x: 19, y: 11 },
                            { x: 19, y: 15 },
                            { x: 17, y: 14 },
                            { x: 15, y: 15 },
                            { x: 15, y: 18 },
                            { x: 11, y: 20 },
                            { x: 11, y: 9 }
                        ]
                    },
                    {
                        id: "mackenzie",
                        borders: [
                            { x: 11, y: 20 },
                            { x: 15, y: 18 },
                            { x: 15, y: 15 },
                            { x: 17, y: 14 },
                            { x: 19, y: 15 },
                            { x: 19, y: 22 },
                            { x: 21, y: 23 },
                            { x: 21, y: 35 },
                            { x: 19, y: 36 },
                            { x: 19, y: 40 },
                            { x: 17, y: 41 },
                            { x: 17, y: 45 },
                            { x: 15, y: 44 },
                            { x: 15, y: 42 },
                            { x: 13, y: 41 },
                            { x: 15, y: 40 },
                            { x: 15, y: 31 },
                            { x: 13, y: 30 },
                            { x: 13, y: 21 },
                            { x: 11, y: 20 }
                        ]
                    }
                ]
            }
        ]
    };

    return map;
}