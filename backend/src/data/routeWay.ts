import { WayPoints } from "../constants/wayPoints";
export const routeWaypoints: Record<number, [number, number][]> = {
    //first is the starting point coordinates
    27: [
        [12.898680, 80.227899],
        WayPoints.Kelambakkam,
        WayPoints.Mambakkam,
        WayPoints.VIT
    ],
    29: [
        WayPoints.Velachery_Vijaynagar,
        WayPoints.Mambakkam_Uturn,
        WayPoints.VIT
    ],
    20: [
        [12.963548, 80.246752],
        WayPoints.Kovilambakkam,
        WayPoints.Mambakkam_Uturn,
        WayPoints.VIT
    ],
    22: [
        WayPoints.Guindy_100FT,
        WayPoints.Kaiveli,
        WayPoints.Mambakkam_Uturn,
        WayPoints.VIT
    ],
    9: [
        [13.029305, 80.268408],
        [13.016302, 80.240803],
        WayPoints.Guindy_100FT,
        WayPoints.Kaiveli,
        WayPoints.Mambakkam_Uturn,
        WayPoints.VIT
    ],
    13: [
        [13.037388, 80.267759],
        WayPoints.Madhyakailash,
        WayPoints.SRP_Tools,
        WayPoints.Velachery_Vijaynagar,
        WayPoints.Mambakkam_Uturn,
        WayPoints.VIT
    ],
    24: [
        [12.965633, 80.204400],
        WayPoints.Kovilambakkam,
        WayPoints.Mambakkam_Uturn,
        WayPoints.VIT
    ],
    19: [
        [12.999179, 80.193273],
        WayPoints.Kaiveli,
        WayPoints.Mambakkam_Uturn,
        WayPoints.VIT
    ],
    55: [
        [13.076847, 80.161319],
        WayPoints.Vandalur,
        WayPoints.VIT
    ],
    76: [
        [12.970751, 80.145184],
        WayPoints.Tambaram,
        WayPoints.Medavakkam,
        WayPoints.Mambakkam_Uturn,
        WayPoints.VIT,
    ]
};