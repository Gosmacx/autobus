ymaps.ready(init);
function init(){ 
      
    var myMap = new ymaps.Map("map", {
        center: [40.19624, 29.06050],
        zoom: 13,
        controls: []
    });


    let otobusler = new ymaps.GeoObjectCollection();
    myMap.geoObjects.add(otobusler);



    const createBusMark = info => {

        let mark = new ymaps.Placemark([info.x, info.y], {
            // hintContent: 'A custom placemark icon',
            balloonContent: ` 
            hız: ${info.speed.toString().split(".")[0]}/kmh
            `
        }, {

            iconLayout: 'default#image',
        iconImageHref: './myIcon.png',
        iconImageSize: [40, 40],
        iconImageOffset: [-5, -38]
        })

        return mark
    }

    const createLine = info => {

        const cords = info.cords

        let routeName;
        let routeColor;

        if (info.route == "go") {
            routeName = "Gidiş"
            routeColor = "#800000"
        } else {
            routeName = "Dönüş"
            routeColor = "#0048ff"   
        }

        var kords = []
        cords.tracks.forEach(item => {
            kords.push([item.Lat, item.Lng])
        });

        var myPolyline = new ymaps.Polyline(kords, {
            hintContent: routeName
        }, {
            strokeColor: routeColor,
            opacity: "0.5",
            strokeWidth: 4,
        });

        return myPolyline
    }


    fetch("https://ulasimapi.burulas.com.tr/api/NetworkInfo/VehiclesPosition?code=16/İ")
    .then(response => response.json())
    .then(data => {

        let bus = data.data
        // Direction: 1106
        // LineCode: "3/İ"
        // VehicleNo: 1137
        // averageSpeed: 22.462342820179618
        // currentLocation: {Lat: 40.20460167, Lng: 29.06312333}
        // currentSpeed: 30.798082015751223
        // detourRoute: 1.1414172960662121
        // distanceToNextStation: 50.23364376445487
        // lastGPSTime: "2022-03-09T23:36:06"

        for (let item of bus) {
            let loaction = { x:  item.currentLocation.Lat, y:  item.currentLocation.Lng, speed: item.currentSpeed , code: item.LineCode}
            otobusler.add(createBusMark(loaction))
        }

        var dataRota = data.lrd
        // dataRota[0] Gidiş
        // dataRota[1] Dönüş


        myMap.geoObjects.add(createLine({ cords: dataRota[0], route: "go" }));
        if (dataRota[1]) myMap.geoObjects.add(createLine({ cords: dataRota[1], route: "return" }));
    })

    setInterval(() => {
        otobusler.removeAll();
            fetch("https://ulasimapi.burulas.com.tr/api/NetworkInfo/VehiclesPosition?code=16/İ")
            .then(response => response.json())
            .then(data => {

                let bus = data.data
                
                for (let item of bus) {
                    let loaction = { x:  item.currentLocation.Lat, y:  item.currentLocation.Lng, speed: item.currentSpeed , code: item.LineCode}
                    otobusler.add(createBusMark(loaction))
                }

            })
    }, 3000);



}