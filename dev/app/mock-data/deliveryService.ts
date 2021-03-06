import {IDeliveryService} from "../custom-types/index";
let regionsIds:string[] = [
    "1",
    "4",
    "22",
    "28",
    "29",
    "30",
    "2",
    "31",
    "32",
    "3",
    "33",
    "34",
    "35",
    "36",
    "5",
    "77",
    "75",
    "37",
    "6",
    "38",
    "7",
    "39",
    "8",
    "40",
    "41",
    "9",
    "10",
    "42",
    "43",
    "11",
    "44",
    "23",
    "24",
    "82",
    "45",
    "46",
    "47",
    "48",
    "49",
    "12",
    "13",
    "50",
    "51",
    "78",
    "52",
    "53",
    "54",
    "55",
    "56",
    "57",
    "58",
    "59",
    "25",
    "60",
    "61",
    "62",
    "63",
    "64",
    "14",
    "65",
    "66",
    "15",
    "67",
    "26",
    "68",
    "16",
    "69",
    "70",
    "71",
    "17",
    "72",
    "18",
    "73",
    "27",
    "19",
    "79",
    "74",
    "20",
    "21",
    "80",
    "81",
    "76"
];

export const DELIVERYSERVCES:IDeliveryService[] = [
    {
        id: 0,
        name: "Курьерская доставка",
        minPrice: null,
        maxPrice: 3000,
        regions: [
            "86"
        ],
        price: 300
    },
    {
        id: 1,
        name: "Курьерская доставка",
        minPrice: 3001,
        maxPrice: null,
        regions: [
            "86"
        ],
        price: 0
    },
    {
        id: 2,
        name: "Почта России",
        minPrice: null,
        maxPrice: 3000,
        regions: regionsIds,
        price: 200
    },
    {
        id: 3,
        name: "Почта России",
        minPrice: 3001,
        maxPrice: null,
        regions: regionsIds,
        price: 0
    }

];


