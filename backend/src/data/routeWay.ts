import { WayPoints } from "../constants/wayPoints";
export const routeWaypoints: Record<number, [number, number][]> = {
    //first is the starting point coordinates
    1: [
        [12.898680, 80.227899],
        WayPoints.Kelambakkam,
        WayPoints.Mambakkam,
        WayPoints.VIT,
    ],
    2: [
        [12.987250, 80.218331],
        WayPoints.Velachery_Vijaynagar,
        WayPoints.Mambakkam_Uturn,
        WayPoints.VIT,
    ],
    3: [
        [12.987829, 80.176888],
        WayPoints.Vandalur,
        WayPoints.VIT,
    ]
};