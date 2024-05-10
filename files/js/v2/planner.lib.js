var LIB = {};

// Разное *****************************************************************************************

// сгенерировать id
LIB.id = function () {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 7 characters
    // after the decimal.
    return Math.random().toString(36).substr(2, 7);
};
// рандомный цвет
LIB.randomColor = function () {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


// отрезок по двум точкам + доп. данные
LIB.line = function (s, e, sPlus = 0, ePlus = 0) {

    if (sPlus) s = LIB.pointOnLine(e, s, sPlus);
    if (ePlus) e = LIB.pointOnLine(s, e, ePlus);
    return {s: s, e: e, c: LIB.center(s, e)};
}
// расстояние между двумя точками
LIB.distance = function (p1, p2) {

    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};
// центр между двумя точками
LIB.center = function (p1, p2) {

    return {x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2};
};
// точка, лежащая на прямой отрезка, на заданном расстоянии от начала или конца отрезка
LIB.pointOnLine = function (s, e, distance) {
    // Имеется отрезок s-e с координатами s = {x: x, y: y} и e = {x: x, y: y}.
    // Требуется найти координаты точки s {x: x, y: y}, лежащей на отрезке s-e на расстоянии distance от точки e
    let d = LIB.distance(s, e);
    let a = d + distance;
    let b = d;
    let k = a / b;
    let x = s.x + (e.x - s.x) * k;
    let y = s.y + (e.y - s.y) * k;
    return {x: x, y: y};
}
// имеют ли две точки "одинаковые" координаты
LIB.arePointsEqual = function (p1, p2, radius = .5) {

    return (Math.abs(p1.x - p2.x) <= .5) && (Math.abs(p1.y - p2.y) <= radius)
};
// объединение линии с другими линями в общем массиве
LIB.mergeLines = function (line, index, lines) {

    next:
        for (let i = 0; i < lines.length; i++) {
            let otherLine = lines[i];
            if (i !== index) {

                let a = LIB.arePointsEqual(line.s, otherLine.s);
                let b = LIB.arePointsEqual(line.s, otherLine.e);
                let c = LIB.arePointsEqual(line.e, otherLine.s);
                let d = LIB.arePointsEqual(line.e, otherLine.e);

                if (a || b || c || d) {

                    let angle = get_two_lines_angle(line, otherLine);
                    if (angle === 180) {
                        if (a) {
                            line.s = copy_point(otherLine.e);
                            lines.splice(i, 1);
                            break next;
                        }
                        if (b) {
                            line.s = copy_point(otherLine.s);
                            lines.splice(i, 1);
                            break next;
                        }
                        if (c) {
                            line.e = copy_point(otherLine.e);
                            lines.splice(i, 1);
                            break next;
                        }
                        if (d) {
                            line.e = copy_point(otherLine.s);
                            lines.splice(i, 1);
                            break next;
                        }
                    }
                }


                // // проверяем, лежат ли линии на одной прямой
                // let big_line = get_big_line(line, 10); show_line(big_line);
                // // если отрезки на одной прямой
                // if (is_point_on_line(otherLine.s, big_line) && is_point_on_line(otherLine.e, big_line)) {
                //     if (LIB.arePointsEqual(line.s, otherLine.s) && !is_point_on_line(otherLine.e, line)) {
                //         line.s = copy_point(otherLine.e);
                //         lines.splice(i, 1);
                //         break next;
                //     }
                //     if (LIB.arePointsEqual(line.s, otherLine.e) && !is_point_on_line(otherLine.s, line)) {
                //         line.s = copy_point(otherLine.s);
                //         lines.splice(i, 1);
                //         break next;
                //     }
                //     if (LIB.arePointsEqual(line.e, otherLine.s) && !is_point_on_line(otherLine.e, line)) {
                //         line.e = copy_point(otherLine.e);
                //         lines.splice(i, 1);
                //         break next;
                //     }
                //     if (LIB.arePointsEqual(line.e, otherLine.e) && !is_point_on_line(otherLine.s, line)) {
                //         line.e = copy_point(otherLine.s);
                //         lines.splice(i, 1);
                //         break next;
                //     }
                // }
            }
        }
}
// принадлежность точки отрезку
LIB.isPointOnLine = function (point, line, k = 0.01) {
    // p - проверяемая точка {x: x, y: y}
    // l - отрезок {s: {x: x, y: y}, e: {x: x, y: y}}
    if (LIB.arePointsEqual(point, line.s)) return true;
    if (LIB.arePointsEqual(point, line.e)) return true;
    return  (Math.abs(LIB.distance(line.s, point) + LIB.distance(line.e, point) - LIB.distance(line.s, line.e)) < k); // последний кооэффициент выставляется вручную
};
//
LIB.unique = function (points) {

    let result = [];
    next:
        for (let i = 0; i < points.length; i++) {
            for (let k = 0; k < result.length; k++) { // ищем, был ли он уже?
                if (LIB.arePointsEqual(result[k], points[i])) continue next; // если да, то следующий
            }
            result.push(points[i]);
        }
    return result;
}

// Пересечения ************************************************************************************

// пересечение двух отрезков
LIB.twoLinesIntersection = function (l1, l2, strict = true) {

    if (strict === false) {
        if (LIB.arePointsEqual(l1.s, l2.s)) return false;
        else if (LIB.arePointsEqual(l1.s, l2.e)) return false;
        if (LIB.arePointsEqual(l1.e, l2.s)) return false;
        else if (LIB.arePointsEqual(l1.e, l2.e)) return false;
    }

    if (LIB.isPointOnLine(l1.s, l2)) return false;
    else if (LIB.isPointOnLine(l1.e, l2)) return false;
    if (LIB.isPointOnLine(l2.s, l1)) return false;
    else if (LIB.isPointOnLine(l2.e, l1)) return false;

    let a = (l2.e.x - l2.s.x) * (l1.s.y - l2.s.y) - (l2.e.y - l2.s.y) * (l1.s.x - l2.s.x);
    let b = (l1.e.x - l1.s.x) * (l1.s.y - l2.s.y) - (l1.e.y - l1.s.y) * (l1.s.x - l2.s.x);
    let d = (l2.e.y - l2.s.y) * (l1.e.x - l1.s.x) - (l2.e.x - l2.s.x) * (l1.e.y - l1.s.y);

    if (d === 0)
        return false; // Прямые параллельны

    if (a === 0 && d === 0)
        return false; // Прямые совпадают

    if (b === 0 && d === 0)
        return false; // Прямые совпадают

    let e1 = a / d;
    let e2 = b / d;

    if ((e1 >= 0 && e1 <= 1) && (e2 >= 0 && e2 <= 1))
        return {
            x: l1.s.x + e1 * (l1.e.x - l1.s.x),
            y: l1.s.y + e1 * (l1.e.y - l1.s.y)
        };
    else
        return false;

};
// пересечение отрезка с границами полигона
LIB.lineAndPolygonIntersections = function (line, polygon) {

    if (!line.c) line.c = LIB.center(line.s, line.e);
    // луч от центра отрезка в сторону начальной точки отрезка
    let sRay = LIB.line(line.c, line.s, 0, 5); //show.line(sRay, 2)
    // луч от центра отрезка в сторону конечной точки отрезка
    let eRay = LIB.line(line.c, line.e, 0, 5); //show.line(eRay, 2, "blue");
    // возможные точки пересечения
    let sInt, eInt;

    // Совпадают ли точки отрезка с какой-либо точкой полигона ************************************

    for (let i = 0; i < polygon.length; i++) {
        let point = polygon[i];
        if (LIB.arePointsEqual(point, line.s)) sInt = line.s;
        if (LIB.arePointsEqual(point, line.e)) eInt = line.e;
    }

    // Есть ли пересечение отрезка с какой-либо гранью полигона ***********************************

    let polygonEdges = LIB.polygonEdges(polygon);
    if (!sInt) {
        for (let i = 0; i < polygonEdges.length; i++) {
            let edge = polygonEdges[i];
            let int = LIB.twoLinesIntersection(sRay, edge);
            if (int) sInt = int;
        }
    }
    if (!eInt) {
        for (let i = 0; i < polygonEdges.length; i++) {
            let edge = polygonEdges[i];
            let int = LIB.twoLinesIntersection(eRay, edge);
            if (int) eInt = int;
        }
    }

    // Финал **************************************************************************************

    if (sInt && eInt) return [sInt, eInt];
    else return [];
}

// Полигон ****************************************************************************************

// построить грани полигона
LIB.polygonEdges = function (polygon) {

    let edges = [];
    for (let k = 0; k < polygon.length; k++) {
        let s = polygon[k];
        let e;
        k === polygon.length - 1 ? e = polygon[0] : e = polygon[k + 1];
        let edge = LIB.line(s, e)
        edges.push(edge);
    }
    return edges;
}
// упрощаем полигон
LIB.simplifyPolygon = function (polygon) {

    // отмечаем на удаление точки, лежащие между предыдущей и последующей точками
    for (let i = 0; i < polygon.length; i++) {
        let s, e;
        if (i === 0) {
            s = polygon[polygon.length - 1];
            e = polygon[1];
        } else if (i === polygon.length - 1) {
            s = polygon[polygon.length - 2];
            e = polygon[0];
        } else {
            s = polygon[i - 1];
            e = polygon[i + 1];
        }
        let line = get_line(s, e)
        delete polygon[i].remove;
        if (is_point_between_line_points(polygon[i], line)) {
            polygon[i].remove = true;
        }
    }
    // удаляем отмеченные на удаление точки цикла
    for (let i = 0; i < polygon.length; i++) {
        if (polygon[i].remove === true) {
            polygon.splice(i, 1);
            i--;
        }
    }
    return polygon;
}
// разделить полигон на две части по линии разделения
LIB.splitPolygonByLine = function (polygon, line) {

    // находим точки пересечения линии и полигона комнаты
    let ints = LIB.lineAndPolygonIntersections(line, polygon);

    // если есть 2 пересечения
    if (ints.length === 2) {

        //show.point(ints[0], 3)
        //show.point(ints[1], 5)
        //
        // добавляем точки пересечения линии и полигона в точки полигона
        for (let i = 0; i < polygon.length; i++) {
            let s = polygon[i];
            let e = polygon[i + 1];
            if (i === polygon.length - 1) e = polygon[0];
            let edge = {s: s, e: e}
            if (is_point_on_line(ints[0], edge)) {
                polygon.splice(i + 1, 0, ints[0]);
                break;
            }
        }
        for (let i = 0; i < polygon.length; i++) {
            let s = polygon[i];
            let e = polygon[i + 1];
            if (i === polygon.length - 1) e = polygon[0];
            let edge = {s: s, e: e}
            if (is_point_on_line(ints[1], edge)) {
                polygon.splice(i + 1, 0, ints[1]);
                break;
            }
        }

        // let t = 2;
        // for (let i = 0; i < polygon.length; i++) {
        //     //show.point(polygon[i], t, "black");
        //     t += 1.4;
        // }

        // создаем грани
        let edges = [];
        for (let i = 0; i < polygon.length; i++) {
            let s = polygon[i];
            let e = polygon[i + 1];
            if (i === polygon.length - 1) e = polygon[0];
            edges.push(get_line(s, e));
        }

        // удаляем из массива грани, меньше 1
        for (let i = 0; i < edges.length; i++) {
            if (LIB.lineLength(edges[i]) < 1) {
                edges.splice(i, 1);
                i--;
            }
        }

        // поиск связей между гранями
        for (let i = 0; i < edges.length; i++) {
            let edge = edges[i];
            for (let k = 0; k < edges.length; k++) {
                if (k === i) continue;
                let oedge = edges[k];
                // примыкающая грань к точке S
                if (get_distance(edge.s, oedge.s) < 1) edge.slink = {index: k, end: "S"};
                else if (get_distance(edge.s, oedge.e) < 1) edge.slink = {index: k, end: "E"};
                // примыкающая грань к точке E
                if (get_distance(edge.e, oedge.s) < 1) edge.elink = {index: k, end: "S"};
                else if (get_distance(edge.e, oedge.e) < 1) edge.elink = {index: k, end: "E"};
            }
        }

        // начальная грань для поиска цикла
        let startEdge;
        for (let i = 0; i < edges.length; i++) {
            if (LIB.arePointsEqual(edges[i].s, ints[0])) {
                startEdge = edges[i];
                break;
            }
        }

        // находим цикл
        function get_cycle(edge, edges, stop_point) {
            let cycle = [edge.s];
            let do_while = true;
            let start_point = copy.point(edge.s);
            let start_position = "E";
            let count = 0;
            //show.line(edge, 3);
            //show.point(stop_point, 10, "grey")
            do {
                //show.line(edge, 2)
                if (start_position === "E") {
                    if (edge && edge.elink) {
                        cycle.push(edge.e)
                        edge.passed = true;
                        if (edge.elink.end === "S") start_position = "E";
                        if (edge.elink.end === "E") start_position = "S";
                        // следующая грань
                        edge = edges[edge.elink.index];
                    } else {
                        do_while = false;
                    }
                } else if (start_position === "S") {
                    if (edge && edge.slink) {
                        cycle.push(edge.s)
                        edge.passed = true;
                        if (edge.slink.end === "S") start_position = "E";
                        if (edge.slink.end === "E") start_position = "S";
                        edge = edges[edge.slink.index];
                    } else {
                        do_while = false;
                    }
                }
                if (cycle.length > 2) {
                    if (LIB.arePointsEqual(cycle[cycle.length - 1], stop_point)) {
                        //show.point.point(cycle[cycle.length - 1], 10, "black")
                        //show.point.point(stop_point, 6, "red")
                        //console.warn("Достижение стопточки")
                        edge.passed = true;
                        do_while = false
                    }
                }
                count++;
            } while (do_while === true && count < edges.length);
            return cycle;
        }

        let cycle = get_cycle(startEdge, edges, ints[1]);

        // 1 полигон в результате разделения равен циклу
        let newPolygon1 = cycle.slice();

        // 2 полигон в результате разделения равен начальному полигону минус часть точек из нового1
        let newPolygon2 = polygon.slice();
        for (let i = 0; i < cycle.length; i++) {
            if (LIB.arePointsEqual(cycle[i], ints[0])) continue;
            if (LIB.arePointsEqual(cycle[i], ints[1])) continue;
            for (let k = 0; k < newPolygon2.length; k++) {
                if (LIB.arePointsEqual(cycle[i], newPolygon2[k])) {
                    newPolygon2.splice(k, 1);
                    k--;
                }
            }
        }

        // удаляем дубликаты точек
        newPolygon1 = LIB.unique(newPolygon1);
        newPolygon2 = LIB.unique(newPolygon2);
        // упрощаем полигон
        newPolygon1 = LIB.simplifyPolygon(newPolygon1);
        newPolygon2 = LIB.simplifyPolygon(newPolygon2);

        // // ВИЗУАЛИЗАЦИЯ
        // console.warn("newPolygon1", newPolygon1)
        // console.warn("newPolygon2", newPolygon2)
        // show.polygon(newPolygon1)
        //show.polygon(newPolygon2)

        return [newPolygon1, newPolygon2];
    }
    return [];
}








// ТОЧКА ------------------------------------------------------------------------------------------

// координаты точки по x и y
LIB.point = function (x, y, type) {
    if (type === "svg") {
        let p = svg.node.createSVGPoint();
        p.x = x.toFixed(2);
        p.y = y.toFixed(2);
        let CTM = svg.node.getScreenCTM().inverse();
        p = p.matrixTransform(CTM);
        return {
            x: parseFloat(p.x.toFixed(2)),
            y: parseFloat(p.y.toFixed(2))
        }
    }
    if (type === "screen") {
        let p = svg.node.createSVGPoint();
        p.x = x;
        p.y = y;
        let CTM = svg.node.getScreenCTM();
        return p.matrixTransform(CTM);
    }
    return {x: x, y: y};
}

LIB.pointSVG = function (x, y) {

    let test = false;
    // let test = Math.random() > 0.5;

    if ((!x || !y || test) && window.global_event_mousemove) {
        x = window.global_event_mousemove.x;
        y = window.global_event_mousemove.y;
    }

    return LIB.point(x, y, "svg");
}
// принадлежность точки отрезку
LIB.isPointOnLine = function (point, line, k = 0.01) {
    // p - проверяемая точка {x: x, y: y}
    // l - отрезок {s: {x: x, y: y}, e: {x: x, y: y}}
    if (LIB.arePointsEqual(point, line.s)) return true;
    if (LIB.arePointsEqual(point, line.e)) return true;
    return  (Math.abs(LIB.distance(line.s, point) + LIB.distance(line.e, point) - LIB.distance(line.s, line.e)) < k); // последний кооэффициент выставляется вручную
};
// принадлежность точки полигону
LIB.isPointInsidePolygon = function (point, polygon) {

    for (let i = 0; i < polygon.length; i++) {
        let edge = get_line(polygon[i], polygon[i + 1]);
        if (i === polygon.length - 1) edge = get_line(polygon[i], polygon[0]);
        // если точка лежит на грани полигона - значит она НЕ внутри полигона
        if (is_point_on_line(point, edge)) return false;
    }

    // ray-casting algorithm based on http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    // point - точка
    // polygon - массив точек полигона
    let result = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        let xi = polygon[i].x, yi = polygon[i].y;
        let xj = polygon[j].x, yj = polygon[j].y;
        let intersect = ((yi > point.y) != (yj > point.y))
            && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
        if (intersect) result = !result;
    }
    return result;
};

// ЛИНИЯ (ОТРЕЗОК) --------------------------------------------------------------------------------

// диагональ через точку, угол 45
LIB.line45 = function (point, angle) {
    // линия "/"
    if (angle === 45) {
        let s = LIB.point(point.x + 100000, point.y - 100000);
        let e = LIB.point(point.x - 100000, point.y + 100000);
        return LIB.line(s, e);
    }
    // линия "\"
    if (angle === -45) {
        let s = LIB.point(point.x - 100000, point.y - 100000);
        let e = LIB.point(point.x + 100000, point.y + 100000);
        return LIB.line(s, e);
    }
}

// положение точки относительно отрезка
LIB.position = function (point, line) {
    // Есть линия l = {s: {x: x, y: y}, e: {x: x, y: y}), и точка p {x: x, y: y}
    // Определяем, как расположена p относительно l.
    // Если d = 0 - значит, p лежит на l.
    // Если d > 0 - значит, p лежит слева от l.
    // Если d < 0 - значит, p С лежит справа от l.
    let d = (point.x - line.s.x) * (line.e.y - line.s.y) - (point.y - line.s.y) * (line.e.x - line.s.x);
    if (d === 0) return "A"; // ось
    if (d > 0) return "L";
    if (d < 0) return "R";
}
// проекция точки на отрезок
LIB.projection = function (point, line) {
    // исходная формула
    // let xk = xa + (xb - xa) * (((xs - xa) * (xb - xa) + (ys - ya) * (yb - ya) + (zs - za) * (zb - za)) / (Math.pow(xb - xa, 2) + Math.pow(yb - ya, 2) + Math.pow(zb - za, 2)));
    // let yk = ya + (yb - ya) * (((xs - xa) * (xb - xa) + (ys - ya) * (yb - ya) + (zs - za) * (zb - za)) / (Math.pow(xb - xa, 2) + Math.pow(yb - ya, 2) + Math.pow(zb - za, 2)));
    let p = point;
    let s = line.s;
    let e = line.e;
    // находим проекцию точки на прямую отрезка
    let projection = {
        x: s.x + (e.x - s.x) * (((p.x - s.x) * (e.x - s.x) + (p.y - s.y) * (e.y - s.y)) / (Math.pow(e.x - s.x, 2) + Math.pow(e.y - s.y, 2))),
        y: s.y + (e.y - s.y) * (((p.x - s.x) * (e.x - s.x) + (p.y - s.y) * (e.y - s.y)) / (Math.pow(e.x - s.x, 2) + Math.pow(e.y - s.y, 2)))
    };
    // проверяем, принадлежит ли проекция отрезку
    if (LIB.isPointOnLine(projection, line)) return projection;
    return false;
};
// точка, лежащая на прямой отрезка, на заданном расстоянии от начала или конца отрезка
LIB.pointOnLine = function (s, e, distance) {
    // Имеется отрезок s-e с координатами s = {x: x, y: y} и e = {x: x, y: y}.
    // Требуется найти координаты точки s {x: x, y: y}, лежащей на отрезке s-e на расстоянии distance от точки e
    let a = LIB.distance(s, e) + distance;
    let b = LIB.distance(s, e);
    let k = a / b;
    let x = s.x + (e.x - s.x) * k;
    let y = s.y + (e.y - s.y) * k;
    return {x: x, y: y};
}
// точка на заданном расстоянии и положении от центра отрезка
LIB.pointAtLineCenter = function (s, e, offset, position) {
    // s начальная точка внешней грани элемента
    // e конечная точка внутренней грани элемента
    // offset - расстояние от центра заданного отрезка до искомой точки
    // position - положение искомой точки, "слева" или "справа" от центра заданного отрезка
    // расстояние от s до e (длина отрезка s-e)
    let distance = LIB.distance(s, e);
    // результат
    if (position === "R") {
        return {
            x: (s.x + e.x) / 2 + offset * (s.y - e.y) / distance,
            y: (s.y + e.y) / 2 - offset * (s.x - e.x) / distance
        };
    };
    if (position === "L") {
        return {
            x: (s.x + e.x) / 2 - offset * (s.y - e.y) / distance,
            y: (s.y + e.y) / 2 + offset * (s.x - e.x) / distance
        };
    };
};
// точка на заданном расстоянии и положении от заданной точки отрезка
LIB.pointAtLinePoint = function (line, point, offset, position) {

    let parallel = LIB.parallel(line.s, line.e, offset, position);
    return LIB.projection(point, parallel);
}
// линия параллельная заданной линии
LIB.parallel = function (s, e, offset, position) {
    // s начальная точка линии элемента
    // e конечная точка линии элемента
    // offset - расстояние от отрезка до параллельной линии
    // position - положение искомой точки, "слева" или "справа" от центра заданного отрезка
    let p = LIB.pointAtLineCenter(s, e, offset, position);
    return {
        s: {x: p.x - (e.x - s.x) * 5, y: p.y - (e.y - s.y) * 5},
        e: {x: p.x - (e.x - s.x) * -5, y: p.y - (e.y - s.y) * -5}
    };
};
// центр между двумя точками
LIB.center = function (s, e) {
    return {x: (s.x + e.x) / 2, y: (s.y + e.y) / 2};
};

// центр отрезка
LIB.lineCenter = function (line) {
    return {x: (line.s.x + line.e.x) / 2, y: (line.s.y + line.e.y) / 2};
};
// длина отрезка
LIB.lineLength = function (line) {
    return Math.sqrt(Math.pow(line.s.x - line.e.x, 2) + Math.pow(line.s.y - line.e.y, 2));
};
// угол наклона линии
LIB.lineAngle = function (line, type = "deg") {

    // Угол находится как арктангенс (y2-y1)/(x2-x1). В javascript это функция Math.atan2(y2-y1, x2-x1).
    // Если вращение получается не в ту сторону, то результат нужно умножить на -1
    // Если положение при 0 градусов не такое, какое нужно, то к результату нужно добавить соответствено 90, 180 или 270 градусов.

    // in radians
    if (type === 'rad')
        return Math.atan2(line.e.y - line.s.y, line.e.x - line.s.x);
    // in degrees
    if (type === 'deg')
        return Math.atan2(line.e.y - line.s.y, line.e.x - line.s.x) * 180 / Math.PI;
}
// увеличить отрезок
LIB.extendLine = function (line, sValue, eValue) {
    let newLine = {};
    newLine.s = copy.point(line.s);
    newLine.e = copy.point(line.e);
    if (sValue && sValue !== 0) newLine.s = LIB.pointOnLine(line.e, line.s, sValue);
    if (eValue && eValue !== 0) newLine.e = LIB.pointOnLine(line.s, line.e, eValue);
    return newLine;
};
//
LIB.copyPoint = function (point) {
    return {x: point.x, y: point.y}
}
//
LIB.fixPoint = function (point) {
    return {
        x: parseInt(point.x * 100) / 100,
        y: parseInt(point.y * 100) / 100
    };
}
//
LIB.isObjectEmpty = function (object) {
    // если тело цикла начнет выполняться - значит в объекте есть свойства
    for (let key in object) {
        return false;
    }
    return true;
}
//
LIB.isPoint = function (point) {
    return is_a_number(point.x) && is_a_number(point.y)
}

LIB.angleBetweenTwoLines = function (line1, line2) {

    // получаем вектора
    let v1 = get_vector(line1);
    let v2 = get_vector(line2);
    // скалярное произведение векторов
    let a = (v1.x * v2.x + v1.y * v2.y);
    // произведение длин векторов
    let b = Math.sqrt(Math.pow(v1.x, 2) + Math.pow(v1.y, 2)) * Math.sqrt(Math.pow(v2.x, 2) + Math.pow(v2.y, 2))
    // косинус угла между векторами
    let cos = a / b;
    // угол между векторами в радианах
    let angle = Math.acos(cos);
    // угол между векторами в градусах
    angle = Math.round(angle * 180 / Math.PI);
    if (isNaN(angle) || angle === 0) return 180;
    //console.warn(Math.round(angle * 180 / Math.PI))
    return angle;
}

// Получить вектор
LIB.vector = function (line) {

    let s = line.s;
    let e = line.e;

    return {x: e.x - s.x, y: e.y - s.y};
};
//
LIB.areLinesCodirection = function (line1, line2) {
    let v1 = LIB.vector(line1);
    let v2 = LIB.vector(line2);
    // Векторы сонаправленны, если их скалярное произведение > 0
    return (v1.x * v2.x + v1.y * v2.y) > 0;
}
















//
window.get_object = function (array, id) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] && array[i].id === id) {
            return array[i];
        }
    }
}
window.objectIndexById = function (array, id) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].id === id) {
            return i;
        }
    }
}

window.copy = {
    point: function (p) {
        return {x: p.x, y: p.y};
    },
    line: function (l) {
        return {s: {x: l.s.x, y: l.s.y}, e: {x: l.e.x, y: l.e.y}};
    },
    polygon: function (polygon) {
        let result = [];
        for (let i = 0; i < polygon.length; i++) {
            result.push(copy.point(polygon[i]));
        }
        return result;
    },
    object: function (value) {
        return JSON.parse(JSON.stringify(value));
    }
}

function is_a_number (value) {
    value = parseInt(value);
    return value >= 0 || value <= 0
}

function is_point_exists (point) {
    return is_a_number(point.x) && is_a_number(point.y)
}
function is_point_not_zero (point) {
    return point.x === 0 && point.y === 0
}

// сравнение расстояний
function compare_distances(a, b) {
    return a.distance - b.distance;
}
// сравнениe площадей
function compare_areas(a, b) {
    return a.area - b.area;
}


// нахождение проекции точки на отрезок
function get_projection (point, line) {
    // исходная формула
    //let xk = xa + (xb - xa) * (((xs - xa) * (xb - xa) + (ys - ya) * (yb - ya) + (zs - za) * (zb - za)) / (Math.pow(xb - xa, 2) + Math.pow(yb - ya, 2) + Math.pow(zb - za, 2)));
    //let yk = ya + (yb - ya) * (((xs - xa) * (xb - xa) + (ys - ya) * (yb - ya) + (zs - za) * (zb - za)) / (Math.pow(xb - xa, 2) + Math.pow(yb - ya, 2) + Math.pow(zb - za, 2)));
    let p = point;
    let s = line.s;
    let e = line.e;
    // находим проекцию точки на прямую отрезка
    let projection = {
        x: s.x + (e.x - s.x) * (((p.x - s.x) * (e.x - s.x) + (p.y - s.y) * (e.y - s.y)) / (Math.pow(e.x - s.x, 2) + Math.pow(e.y - s.y, 2))),
        y: s.y + (e.y - s.y) * (((p.x - s.x) * (e.x - s.x) + (p.y - s.y) * (e.y - s.y)) / (Math.pow(e.x - s.x, 2) + Math.pow(e.y - s.y, 2)))
    };
    // проверяем, принадлежит ли проекция отрезку
    if (is_point_on_line(projection, line))
        return projection;
    return false;
}
// находится ли точка в полигоне
function is_point_inside_polygon (point, polygon) {

    for (let i = 0; i < polygon.length; i++) {
        let edge = get_line(polygon[i], polygon[i + 1]);
        if (i === polygon.length - 1) edge = get_line(polygon[i], polygon[0]);
        // если точка лежит на грани полигона - значит она НЕ внутри полигона
        if (is_point_on_line(point, edge)) return false;
    }

    // ray-casting algorithm based on http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    // point - точка
    // polygon - массив точек полигона
    let result = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        let xi = polygon[i].x, yi = polygon[i].y;
        let xj = polygon[j].x, yj = polygon[j].y;
        let intersect = ((yi > point.y) != (yj > point.y))
            && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
        if (intersect) result = !result;
    }
    return result;
}
// точка в полигоне, включая его границы
function is_point_over_polygon (point, polygon) {
    // ray-casting algorithm based on http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    // point - точка
    // polygon - массив точек полигона
    let result = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        let xi = polygon[i].x, yi = polygon[i].y;
        let xj = polygon[j].x, yj = polygon[j].y;
        let intersect = ((yi > point.y) != (yj > point.y))
            && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
        if (intersect) result = !result;
    }
    return result;
}

function are_lines_perpendicular_BAK (L1, L2) {
    // направляющий вектор L1
    let v1 = {x: L1.e.x - L1.s.x, y: L1.e.y - L1.s.y}
    // направляющий вектор L2
    let v2 = {x: L2.e.x - L2.s.x, y: L2.e.y - L2.s.y}
    // векторы перпендикулярны, если их скалярное произведение равно нулю
    return (v1.x * v2.x + v1.y * v2.y) === 0;
}
function are_lines_perpendicular (L1, L2) {
    let line1 = get_big_line(L1);
    let line2 = get_big_line(L2);
    let int = line_and_line_intersection(line1, line2);
    if (int) {
        let angle = get_angle(line1.s, int, line2.s);
        return angle >= 89 && angle <= 91;
    }
    return false;
}
function get_perpendicular_line (line, point, length) {
    let s = get_point_near_line_point(line, point, length / 2, "L")
    let e = get_point_near_line_point(line, point, length / 2, "R")
    return get_line(s, e);
}

// По убыванию
function compare_descending(a, b) {

    if (a > b) return -1;

    if (a < b) return 1;

    return 0;
}
// По возрастанию
function compare_ascending(a, b) {

    if (a < b) return -1;

    if (a > b) return 1;

    return 0;
}

function show_point (point, diameter, color) {

    if (!color) color = 'red';
    if (!diameter) diameter = 2;

    return svg.circle(diameter)
        .cx(point.x)
        .cy(point.y)
        .attr({stroke: color, 'stroke-width': 1, fill: color});

}
function show_line (line, stroke_width, color) {

    if (!color) color = 'red';
    if (!stroke_width) stroke_width = .4;

    return svg.line(line.s.x, line.s.y, line.e.x, line.e.y)
        .attr({stroke: color, 'stroke-width': stroke_width});

}

// Расстояние между двумя точками
function get_distance (s, e) {

    return Math.sqrt(Math.pow(s.x - e.x, 2) + Math.pow(s.y - e.y, 2));

};
// Расстояние от точки до отрезка
function get_point_to_line_distance (point, line) {

    let projection = LIB.projection(point, line);
    if (projection) {
        return get_distance(point, projection);
    }
    return false;
};

// Расстояние между двумя точками
function get_line_length (l) {

    return Math.sqrt(Math.pow(l.s.x - l.e.x, 2) + Math.pow(l.s.y - l.e.y, 2));

};

// Центр отрезка по точкам
function get_center(s, e) {

    return {x: (s.x + e.x) / 2, y: (s.y + e.y) / 2};

};

// Центр отрезка
function get_line_center(l) {

    return {x: (l.s.x + l.e.x) / 2, y: (l.s.y + l.e.y) / 2};

};

// Перпендикулярная прямая, проходящая через центр отрезка
function get_normal (s, e) {

    let c = get_center(s, e);

    return {
        s: {
            x: c.x + (s.y - c.y) * 1000,
            y: c.y + (c.x - s.x) * 1000
        },
        e: {
            x: c.x + (s.y - c.y) * (-1000),
            y: c.y + (c.x - s.x) * (-1000)
        }
    };

};

//
function getPolygon (obj, size) {

    if (!size) size = 'small';

    if (size === 'small')
        return [obj.l1, obj.l2, obj.r2, obj.r1];

    if (size === 'big')
        return [obj.s, obj.l1, obj.l2, obj.e, obj.r2, obj.r1];

}

// Линия параллельная заданной линии
function get_parallel(s, e, offset, place) {

    // s начальная точка линии элемента
    // e конечная точка линии элемента
    // offset - расстояние от отрезка до параллельной линии
    // place - положение параллельной линии, "внутри" или "снаружи" от заданного отрезка

    let p = get_point_near_line_center(s, e, offset, place);
    return {
        s: {x: p.x - (e.x - s.x) * 5, y: p.y - (e.y - s.y) * 5},
        e: {x: p.x - (e.x - s.x) * -5, y: p.y - (e.y - s.y) * -5}
    };

};

function get_point_near_line_point(line, point, offset, side) {

    console.warn()

    let parallel = get_parallel(line.s, line.e, offset, side);
    return get_point_projection(point, parallel);
}

function are_lines_collinear (line1, line2) {
    let v1 = get_vector(line1);
    let v2 = get_vector(line2);
    // Векторы на плоскости коллинеарны тогда и только тогда, когда их псевдоскалярное (косое) произведение равно 0
    return (v1.x * v2.y - v2.x * v1.y) === 0;
}

// Нахождение координат точки на заданном расстоянии и положении от центра отрезка
function get_point_near_line_center(s, e, offset, place) {

    // s начальная точка внешней грани элемента
    // e конечная точка внутренней грани элемента
    // offset - расстояние от центра заданного отрезка до искомой точки
    // place - положение искомой точки, "внутри" или "снаружи" от центра заданного отрезка

    // расстояние от s до e (длина отрезка s-e)
    let distance = get_distance(s, e);

    if (place === "R")
        return {
            x: (s.x + e.x) / 2 + offset * (s.y - e.y) / distance,
            y: (s.y + e.y) / 2 - offset * (s.x - e.x) / distance
        };

    if (place === "L")
        return {
            x: (s.x + e.x) / 2 - offset * (s.y - e.y) / distance,
            y: (s.y + e.y) / 2 + offset * (s.x - e.x) / distance
        };

};

// Нахождение координат точки на заданном расстоянии и положении от конца отрезка
function point_near_line_end_point(s, e, offset, place) {

    // s - начальная точка отрезка
    // e - конечная точка отрезка
    // offset - расстояние от конечной точки e отрезка s-e до искомой точки
    // place - положение искомой точки, "внутри" или "снаружи" от конечной точки e отрезка s-e

    // расстояние от s до e (длина отрезка s-e)
    let distance = get_distance(s, e);

    if (place === "R")
        return {
            x: e.x - (e.y - s.y) * offset / distance,
            y: e.y + (e.x - s.x) * offset / distance
        };

    if (place === "L")
        return {
            x: e.x + (e.y - s.y) * offset / distance,
            y: e.y - (e.x - s.x) * offset / distance
        };

};

// Нахождение координат точки на заданном расстоянии и положении от конца отрезка
function point_near_line_end (s, e, offset, place) {

    // s - начальная точка отрезка
    // e - конечная точка отрезка
    // offset - расстояние от конечной точки e отрезка s-e до искомой точки
    // place - положение искомой точки, "внутри" или "снаружи" от конечной точки e отрезка s-e

    // расстояние от s до e (длина отрезка s-e)
    let distance = get_distance(s, e);

    if (place === "R")
        return {
            x: e.x - (e.y - s.y) * offset / distance,
            y: e.y + (e.x - s.x) * offset / distance
        };

    if (place === "L")
        return {
            x: e.x + (e.y - s.y) * offset / distance,
            y: e.y - (e.x - s.x) * offset / distance
        };

};

// Имеют ли две точки одинаковые координаты
function are_points_equal (p1, p2, radius = .5) {

    return (Math.abs(p1.x - p2.x) <= .5) && (Math.abs(p1.y - p2.y) <= radius)

};
function are_points_equal2 (p1, p2) {

    return get_distance(p1, p2) < 1;

    //return (Math.abs(p1.x - p2.x) <= .5) && (Math.abs(p1.y - p2.y) <= .5)

};

// Проекция точки на прямую
function point_to_line_projection (p, l) {

    let s = l.s;
    let e = l.e;

    // исходная формула
    //let xk = xa + (xb - xa) * (((xs - xa) * (xb - xa) + (ys - ya) * (yb - ya) + (zs - za) * (zb - za)) / (Math.pow(xb - xa, 2) + Math.pow(yb - ya, 2) + Math.pow(zb - za, 2)));
    //let yk = ya + (yb - ya) * (((xs - xa) * (xb - xa) + (ys - ya) * (yb - ya) + (zs - za) * (zb - za)) / (Math.pow(xb - xa, 2) + Math.pow(yb - ya, 2) + Math.pow(zb - za, 2)));

    return {
        x: s.x + (e.x - s.x) * (((p.x - s.x) * (e.x - s.x) + (p.y - s.y) * (e.y - s.y)) / (Math.pow(e.x - s.x, 2) + Math.pow(e.y - s.y, 2))),
        y: s.y + (e.y - s.y) * (((p.x - s.x) * (e.x - s.x) + (p.y - s.y) * (e.y - s.y)) / (Math.pow(e.x - s.x, 2) + Math.pow(e.y - s.y, 2)))
    };

}


// Принадлежит ли точка отрезку
function is_point_on_straight (point, line) {

    return (line.s.x - point.x) * (line.e.y - point.y) === (line.e.x - point.x) * (line.s.y - point.y);

};



// Лежат ли два отрезка на одной прямой
function are_lines_on_straight (line1, line2) {

    return is_point_on_straight(line1.s, line2) && is_point_on_straight(line1.e, line2);

};
function get_vector_length(vector) {

    let a = Math.pow(vector.x);
    let b = Math.pow(vector.y);

    return Math.abs(Math.sqrt(a + b));

}


// Угол между тремя точками
function get_angle_old (p1, p2, p3, type) {

    if (type === undefined)
        type = 'deg';

    // Угол между p1p2 и p2p3, где точка p2 еще и точка пересечения этих двух прямых

    let p1p2 = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    let p2p3 = Math.sqrt(Math.pow(p2.x - p3.x, 2) + Math.pow(p2.y - p3.y, 2));
    let p1p3 = Math.sqrt(Math.pow(p3.x - p1.x, 2) + Math.pow(p3.y - p1.y, 2));

    let angle;

    // in radians
    if (type === 'rad')
        angle = Math.acos((p2p3 * p2p3 + p1p2 * p1p2 - p1p3 * p1p3) / (2 * p2p3 * p1p2));

    // in degrees
    if (type === 'deg') {

        angle = (Math.acos((p2p3 * p2p3 + p1p2 * p1p2 - p1p3 * p1p3) / (2 * p2p3 * p1p2))) * 180 / Math.PI;
        if (isNaN(angle)) {
            //console.log('Scheiße!')
            angle = 180;
        }
        if (angle === 0) {
            //console.log('Scheiße!')
            angle = 180;
        }

    }

    return Math.round(angle)
};



function get_angle_OLD (p1, p2, p3, type) {

    if (type === undefined)
        type = 'deg';

    // вектор p2-p1
    let p2_p1 = {x: p1.x - p2.x, y: p1.y - p2.y};

    // вектор p2-p3
    let p2_p3 = {x: p3.x - p2.x, y: p3.y - p2.y};

    let angle;

    // in radians
    if (type === 'rad')
        angle = Math.atan2(p2_p1.x * p2_p3.y - p2_p1.y * p2_p3.x, p2_p1.x * p2_p3.x + p2_p1.y * p2_p3.y);

    // in degrees
    if (type === 'deg')
        angle = Math.atan2(p2_p1.x * p2_p3.y - p2_p1.y * p2_p3.x, p2_p1.x * p2_p3.x + p2_p1.y * p2_p3.y) * 180 / Math.PI;

    if (isNaN(angle)) {
        console.log('Scheiße!')
        //angle = 179;
    }

    return Math.abs(Math.round(angle));



    /*
            if (angle === 0) {
                //console.log('Scheiße!')
                angle = 180;
            }
    */


};

function get_angle (p1, p2, p3) {
    // вектор p2-p1
    let p2_p1 = {x: p1.x - p2.x, y: p1.y - p2.y};
    // вектор p2-p3
    let p2_p3 = {x: p3.x - p2.x, y: p3.y - p2.y};
    // in degrees
    let angle = Math.atan2(p2_p1.x * p2_p3.y - p2_p1.y * p2_p3.x, p2_p1.x * p2_p3.x + p2_p1.y * p2_p3.y) * 180 / Math.PI;
    if (isNaN(angle)) console.log('get_angle: Scheiße!', p1, p2, p3)
    //console.log(Math.abs(angle.toFixed(2)))
    return Math.abs(angle.toFixed(2));
};

function get_two_lines_angle (line1, line2) {

    // получаем вектора
    let v1 = get_vector(line1);
    let v2 = get_vector(line2);
    // скалярное произведение векторов
    let a = (v1.x * v2.x + v1.y * v2.y);
    // произведение длин векторов
    let b = Math.sqrt(Math.pow(v1.x, 2) + Math.pow(v1.y, 2)) * Math.sqrt(Math.pow(v2.x, 2) + Math.pow(v2.y, 2))
    // косинус угла между векторами
    let cos = a / b;
    // угол между векторами в радианах
    let angle = Math.acos(cos);
    // угол между векторами в градусах
    angle = Math.round(angle * 180 / Math.PI);
    if (isNaN(angle) || angle === 0) return 180;
    //console.warn(Math.round(angle * 180 / Math.PI))
    return angle;
}

function is_line_on_straight (line1, line2) {
    let straight = get_big_line(line2);
    let a = is_point_on_line(line1.s, straight, .5);
    let b = is_point_on_line(line1.e, straight, .5);
    return (a && b)
};

function get_line_orientation (line) {
    let v_test = Math.abs(line.s.x - line.e.x) >= 0 && Math.abs(line.s.x - line.e.x) < .1 && (line.s.y !== line.e.y);
    let h_test = Math.abs(line.s.y - line.e.y) >= 0 && Math.abs(line.s.y - line.e.y) < .1 && (line.s.x !== line.e.x);
    if (v_test === true) return "V";
    if (h_test === true) return "H";
    return "D";
}

// Положение точки относительно прямой
function get_point_place(p, l) {
    // Есть линия l = {s: {x: x, y: y}, e: {x: x, y: y}), и точка p {x: x, y: y}
    // Определяем, как расположена p относительно l.
    // Если d = 0 - значит, p лежит на l.
    // Если d > 0 - значит, p лежит слева от l.
    // Если d < 0 - значит, p С лежит справа от l.
    let d = (p.x - l.s.x) * (l.e.y - l.s.y) - (p.y - l.s.y) * (l.e.x - l.s.x);
    if (d === 0) return 'line';
    if (d > 0) return 'left';
    if (d < 0) return 'right';
}

function get_path___ () {

    let path = "M" + this.p1.x + "," + this.p1.y +
        "L" + this.p2.x + "," + this.p2.y +
        "L" + this.p3.x + "," + this.p3.y +
        "L" + this.p4.x + "," + this.p4.y + "Z"

}

function get_polygon_centroid (polygon) {

    let pts = polygon.slice(); // причина копирования - в исходный полигон комнаты добавится лишняя точка
    /*
                let centroid = {x: 0, y: 0};
                for(let i = 0; i < points.length; i++) {
                    let point = points[i];
                    centroid.x += point.x;
                    centroid.y += point.y;
                }
                centroid.x /= points.length;
                centroid.y /= points.length;
                return centroid;
    */

    let first = pts[0];
    let last = pts[pts.length - 1];
    if (first.x != last.x || first.y != last.y) pts.push(first);
    let twicearea = 0,
        x = 0, y = 0,
        nPts = pts.length,
        p1, p2, f;
    for (let i = 0, j = nPts - 1; i < nPts; j = i++) {
        p1 = pts[i]; p2 = pts[j];
        f = (p1.y - first.y) * (p2.x - first.x) - (p2.y - first.y) * (p1.x - first.x);
        twicearea += f;
        x += (p1.x + p2.x - 2 * first.x) * f;
        y += (p1.y + p2.y - 2 * first.y) * f;
    }
    f = twicearea * 3;
    return {x: x / f + first.x, y: y / f + first.y};
}
function get_polygon_edges (polygon) {

    let edges = [];
    for (let k = 0; k < polygon.length; k++) {
        let start = polygon[k], end;
        k === polygon.length - 1 ? end = polygon[0] : end = polygon[k + 1];
        edges.push(get_line(start, end));
    }
    return edges;
}

// Принадлежит ли точка отрезку
function is_point_on_line (point, line, padding = 0.01) {
    if (are_points_equal(point, line.s)) return true;
    if (are_points_equal(point, line.e)) return true;
    // p - проверяемая точка {x: x, y: y}
    // l - отрезок {s: {x: x, y: y}, e: {x: x, y: y}}
    return  (Math.abs(get_distance(line.s, point) + get_distance(line.e, point) - get_distance(line.s, line.e)) < padding); // последний кооэффициент выставляется вручную
};
function is_point_on_line_v2 (point, line, padding = 0.5) {

    if (are_points_equal(point, line.s)) return true;
    if (are_points_equal(point, line.e)) return true;
    let projection = LIB.projection(point, line);
    if (projection) {
        if (get_distance(point, projection) < padding) {
            return true;
        }
    }
    return false;
};
function is_point_on_line_1_sm (point, line, padding = 0.01) {
    if (are_points_equal(point, line.s, 1)) return true;
    if (are_points_equal(point, line.e, 1)) return true;
    // p - проверяемая точка {x: x, y: y}
    // l - отрезок {s: {x: x, y: y}, e: {x: x, y: y}}
    return  (Math.abs(get_distance(line.s, point) + get_distance(line.e, point) - get_distance(line.s, line.e)) < padding); // последний кооэффициент выставляется вручную
};
//
function is_point_close_to_line (point, line) {
    let projection = LIB.projection(point, line);
    if (projection) {
        if (get_distance(point, projection) <= 3) {
            return true;
        }
    }
    return false;
};
// Принадлежит ли точка отрезку строго
function is_point_between_line_points (point, line) {
    // p - проверяемая точка {x: x, y: y}
    // l - отрезок {s: {x: x, y: y}, e: {x: x, y: y}}
    if (are_points_equal(point, line.s)) return false;
    if (are_points_equal(point, line.e)) return false;
    return  (Math.abs(get_distance(line.s, point) + get_distance(line.e, point) - get_distance(line.s, line.e)) < 0.01); // последний кооэффициент выставляется вручную
};

// Принадлежит ли точка прямой
function is_point_on_straigth (point, line) {
    // p - проверяемая точка {x: x, y: y}
    // l - отрезок {s: {x: x, y: y}, e: {x: x, y: y}}
    let straigth = get_big_line(line)
    return  (Math.abs(get_distance(straigth.s, point) + get_distance(straigth.e, point) - get_distance(straigth.s, straigth.e)) < 0.01); // последний кооэффициент выставляется вручную
};

// Лежат ли два отрезка на одной линии (способ 2)
function is_line_on_line_BACKUP (line1, line2) {
    // строим прямую на основе отрезка line1
    let big_line1 = get_big_line(line1, 20); //show_line(big_line1)
    // строим прямую на основе отрезка line2
    let big_line2 = get_big_line(line2, 20); //show_line(big_line2)
    let line1_check1 = get_angle(big_line2.s, line1.s, big_line2.e);
    let line1_check2 = get_angle(big_line2.s, line1.e, big_line2.e);
    let line2_check1 = get_angle(big_line1.s, line2.s, big_line1.e);
    let line2_check2 = get_angle(big_line1.s, line2.e, big_line1.e);
    // Приводим все значения проверок к нулю в случаях если:
    if (isNaN(line1_check1) || line1_check1 === 180) line1_check1 = 0; // NaN - если две точки совпадают
    if (isNaN(line1_check2) || line1_check2 === 180) line1_check2 = 0; // NaN - если две точки совпадают
    if (isNaN(line2_check1) || line2_check1 === 180) line2_check1 = 0; // NaN - если две точки совпадают
    if (isNaN(line2_check2) || line2_check2 === 180) line2_check2 = 0; // NaN - если две точки совпадают
    return (line1_check1 === 0 && line1_check2 === 0 && line2_check1 === 0 && line2_check2 === 0);
}
// СЛИШКОМ ТОЧНО Лежат ли два отрезка на одной линии (способ 2)
function is_line_on_line_СЛИШКОМ_ТОЧНАЯ (line1, line2) {
    // строим прямую на основе отрезка line1
    let straight = get_big_line(line2, 1000); //show.line(straight)
    let s_angle = get_angle(straight.s, line1.s, straight.e, line1, straight);
    let e_angle = get_angle(straight.s, line1.e, straight.e, line1, straight);
    if (isNaN(s_angle) || isNaN(e_angle)) {
        console.log('is_line_on_line: Scheiße!')
        return false;
    }
    if (s_angle === 0) s_angle = 180;
    if (e_angle === 0) e_angle = 180;
    return (s_angle === 180 && e_angle === 180);
}
function is_line_on_line (line1, line2) {
    // строим прямую на основе отрезка line1
    let straight = get_big_line(line2, 1000); //show.line(straight)
    // проверяем принадлежность точек отрезка line1 найденной прямой straight
    let a = is_point_on_line(line1.s, straight);
    let b = is_point_on_line(line1.e, straight);
    return (a && b);
}
//
function is_line_on_line_2 (line1, line2) {

    let plus = get_line_length(line1);
    // строим прямую на основе отрезка line1
    let straight = get_big_line(line2, plus + 10); //show.line(straight)
    // проверяем принадлежность точек отрезка line1 найденной прямой straight
    let a = is_point_on_line(line1.s, straight);
    let b = is_point_on_line(line1.e, straight);
    return (a && b);
}

function get_key_by_value(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

function is_line_on_line_strict (line1, line2) {
    if (is_point_between_line_points(line2.s, line1) || is_point_between_line_points(line2.e, line1)) {
        // строим прямую на основе отрезка line1
        let straight = get_big_line(line2, 1000);
        let s_angle = get_angle(straight.s, line1.s, straight.e, line1, straight);
        let e_angle = get_angle(straight.s, line1.e, straight.e, line1, straight);
        if (isNaN(s_angle) || isNaN(e_angle)) {
            console.log('is_line_on_line: Scheiße!')
            return false;
        }
        if (s_angle === 0) s_angle = 180;
        if (e_angle === 0) e_angle = 180;
        return (s_angle === 180 && e_angle === 180);
    }
    return false;
}

// Косинус угла между векторами)
function two_vectors_cos (line1, line2) {

    let a = get_vector(line1);
    let b = get_vector(line2);

    let res1 = Math.pow(a.x, 2) + Math.pow(a.y, 2);
    let res2 = Math.pow(b.x, 2) + Math.pow(b.y, 2);
    let cos = (a.x * b.x + a.y * b.y) / ((Math.sqrt(res1) * Math.sqrt(res2)));

    return cos;

}

// Пересечение двух отрезков
function line_and_line_intersection(l1, l2) {

    let a = (l2.e.x - l2.s.x) * (l1.s.y - l2.s.y) - (l2.e.y - l2.s.y) * (l1.s.x - l2.s.x);
    let b = (l1.e.x - l1.s.x) * (l1.s.y - l2.s.y) - (l1.e.y - l1.s.y) * (l1.s.x - l2.s.x);
    let d = (l2.e.y - l2.s.y) * (l1.e.x - l1.s.x) - (l2.e.x - l2.s.x) * (l1.e.y - l1.s.y);

    if (d === 0)
        return false; // Прямые параллельны

    if (a === 0 && d === 0)
        return false; // Прямые совпадают

    if (b === 0 && d === 0)
        return false; // Прямые совпадают

    let e1 = a / d;
    let e2 = b / d;

    if ((e1 >= 0 && e1 <= 1) && (e2 >= 0 && e2 <= 1))
        return {
            x: l1.s.x + e1 * (l1.e.x - l1.s.x),
            y: l1.s.y + e1 * (l1.e.y - l1.s.y)
        };
    else
        return false;

};

// Площадь полигона
function polygon_area(points) {

    let xx = [];
    let yy = [];

    points.forEach(function (value) {

        xx.push(value.x);
        yy.push(value.y);

    });

    let area = 0;  // Accumulates area in the loop
    let k = points.length - 1;  // The last vertex is the 'previous' one to the first

    for (let i = 0; i < points.length; i ++) {

        area = area + (xx[k] + xx[i]) * (yy[k] - yy[i]);
        k = i;  //k is previous vertex to i

    }

    return Math.abs(area / 2);

}
// Площадь полигона
function get_polygon_area(polygon, unit) {
    let denominator;
    if (!unit || unit === 'm') denominator = 10000;
    let xx = [];
    let yy = [];
    polygon.forEach(function (value) {
        xx.push(value.x);
        yy.push(value.y);
    });
    let area = 0;  // Accumulates area in the loop
    let k = polygon.length - 1;  // The last vertex is the 'previous' one to the first
    for (let i = 0; i < polygon.length; i ++) {
        area = area + (xx[k] + xx[i]) * (yy[k] - yy[i]);
        k = i;  //k is previous vertex to i
    }
    area = ((Math.abs(area / 2)) / denominator).toFixed(2);
    return parseFloat(area);
}
// "Центр" полигона
function get_polygon_center(polygon) {
    let xx = [];
    let yy = [];
    for (let i = 0, ii = polygon.length; i < ii; i++) {
        xx.push(polygon[i].x);
        yy.push(polygon[i].y);
    }
    let x_min = Math.min.apply(null, xx);
    let x_max = Math.max.apply(null, xx);
    let y_min = Math.min.apply(null, yy);
    let y_max = Math.max.apply(null, yy);
    return {
        x: (x_min + x_max) / 2,
        y: (y_min + y_max) / 2
    }
}


// Свойства полигона
function get_polygon_props(polygon, unit) {

    let denominator;
    if (!unit || unit === 'm') denominator = 10000;
    // собираем все значения X и Y в полигоне
    let xx = [];
    let yy = [];
    polygon.forEach(function (value) {
        xx.push(value.x);
        yy.push(value.y);
    });

    // МИНИМАЛЬНЫЕ И МАКСИМАЛЬНЫЕ ЗНАЧЕНИЯ X И Y

    let x_min = Math.min.apply(null, xx);
    let x_max = Math.max.apply(null, xx);
    let y_min = Math.min.apply(null, yy);
    let y_max = Math.max.apply(null, yy);

    // ПЛОЩАДЬ ПОЛИГОНА

    let area = 0;  // Accumulates area in the loop
    let k = polygon.length - 1;  // The last vertex is the 'previous' one to the first
    for (let i = 0; i < polygon.length; i ++) {
        area = area + (xx[k] + xx[i]) * (yy[k] - yy[i]);
        k = i;  //k is previous vertex to i
    }
    area = ((Math.abs(area / 2)) / denominator).toFixed(2);

    // ГРАНИ ПОЛИГОНА

    let edges = [];
    for (let i = 0; i < polygon.length; i ++) {
        if (i !== polygon.length - 1) {
            let edge = get_line(polygon[i], polygon[i + 1]);
            edges.push(edge);
        } else {
            let edge = get_line(polygon[i], polygon[0]);
            edges.push(edge);
        }
    }

    return {
        edges: edges,
        area: parseFloat(area),
        x_min: x_min,
        x_max: x_max,
        y_min: y_min,
        y_max: y_max
    };
}


// размеры полигона
function get_polygon_dimensions(polygon) {
    let xx = [];
    let yy = [];
    polygon.forEach(function (point) {
        xx.push(point.x);
        yy.push(point.y);
    });
    let x_min = Math.min.apply(null, xx);
    let x_max = Math.max.apply(null, xx);
    let y_min = Math.min.apply(null, yy);
    let y_max = Math.max.apply(null, yy);
    return {
        width: Math.abs(x_min - x_max),
        height: Math.abs(y_min - y_max)
    }
}




// Центр полигона
function polygon_center(points) {
    let xx = [];
    let yy = [];
    points.forEach(function (value) {
        xx.push(value.x);
        yy.push(value.y);
    });
    let x_min = Math.min.apply(null, xx);
    let x_max = Math.max.apply(null, xx);
    let y_min = Math.min.apply(null, yy);
    let y_max = Math.max.apply(null, yy);
    return {
        x: (x_min + x_max) / 2,
        y: (y_min + y_max) / 2,
    }
}

function polygon_center_b(points) {

    let xx = [];
    let yy = [];

    points.forEach(function (value) {
        xx.push(value.x);
        yy.push(value.y);
    });

    let x_min = Math.min.apply(null, xx);
    let x_max = Math.max.apply(null, xx);
    let y_min = Math.min.apply(null, yy);
    let y_max = Math.max.apply(null, yy);

    return {
        x: (x_min + x_max) / 2,
        y: (y_min + y_max) / 2,
        x_min: x_min,
        x_max: x_max,
        y_min: y_min,
        y_max: y_max
    }

}

// Угол наклона линии
function get_line_angle(line, type) {

    // Угол находится как арктангенс (y2-y1)/(x2-x1). В javascript это функция Math.atan2(y2-y1, x2-x1).
    // Если вращение получается не в ту сторону, то результат нужно умножить на -1
    // Если положение при 0 градусов не такое, какое нужно, то к результату нужно добавить соответствено 90, 180 или 270 градусов.

    if (type === undefined)
        type = 'deg';

    // in radians
    if (type === 'rad')
        return Math.atan2(line.e.y - line.s.y, line.e.x - line.s.x);

    // in degrees
    if (type === 'deg')
        return Math.atan2(line.e.y - line.s.y, line.e.x - line.s.x) * 180 / Math.PI;;

}

// Получить точку по X и Y
function get_point(x, y) {
    return {x: x, y: y};
}
// Построить отрезок по двум точкам
function get_line(s, e) {
    return {s: s, e: e};
}
// Построить прямую на основе отрезка
function get_big_line(line, offset) {
    if (!offset) offset = 10000;
    return {
        s: LIB.pointOnLine(line.e, line.s, offset),
        e: LIB.pointOnLine(line.s, line.e, offset)
    }
}
// Построить луч из точки s через точку e
function get_ray(s, e, offset = 0) {
    return get_line(s, LIB.pointOnLine(s, e, offset))
}
function get_short_line(line, sOffset, eOffset) {
    if (!eOffset) eOffset = sOffset;
    return {
        s: LIB.pointOnLine(line.e, line.s, - sOffset),
        e: LIB.pointOnLine(line.s, line.e, - eOffset)
    }
}
// Копирование точки
function copy_point(p) {

    return {x: p.x, y: p.y};

}

// ???
function make_path (points) {

    let path = []

    path.push('M' + [points[0].x, points[0].y]);

    for (let i = 1; i < points.length; i++) {

        path.push('L' + [points[i].x, points[i].y]);

    }

    path.push('Z');

    return path.join(' ');

}

// ???
function get_svg_path(points) {

    let path = [];
    path.push('M');
    for (let i = 0; i < points.length; i++) {
        path.push(points[i].x, points[i].y)
    }
    path.push('Z');
    return path.join(" ");
}

function is_line_inside_line (line1, line2) {
    let a = is_point_on_line(line1.s, line2);
    let b = is_point_on_line(line1.e, line2);
    return (a && b)
}
function is_line_over_line (line1, line2, padding) {
    let a = is_point_on_line(line1.s, line2, padding);
    let b = is_point_on_line(line1.e, line2, padding);
    return (a && b)
}
function is_line_over_line_v2 (line1, line2) {

    let s1 = LIB.pointOnLine(line1.e, line1.s, -.8);
    let e1 = LIB.pointOnLine(line1.s, line1.e, -.8);
    let a = is_point_on_line(s1, line2);
    let b = is_point_on_line(e1, line2);
    if (a && b) return true;
    return false;
}

//
function get_line_polygon_intersections (line, polygon_points) {

    let sint, eint;
    for (let i = 0; i < polygon_points.length; i++) {
        let point = polygon_points[i];
        if (are_points_equal(point, line.s)) sint = line.s;
        if (are_points_equal(point, line.e)) eint = line.e;
    }
    if (!sint || !eint) {
        line.c = get_line_center(line);
        let sline = get_line(line.s, line.c);
        sline = get_big_line(sline, 10);
        let eline = get_line(line.e, line.c);
        eline = get_big_line(eline, 10);
        for (let i = 0; i < polygon_points.length; i++) {
            let point = polygon_points[i];
            let s = polygon_points[i], e;
            if (i === polygon_points.length - 1) e = polygon_points[0];
            else e = polygon_points[i + 1];
            let edge = {s: s, e: e};
            if (!sint) {
                let int = line_and_line_intersection(sline, edge);
                if (int) sint = line_and_line_intersection(sline, edge);
            }
            if (!eint) {
                let int = line_and_line_intersection(eline, edge);
                if (int) eint = line_and_line_intersection(eline, edge);
            }
        }
    }
    if (sint && eint) return [sint, eint]
    return [];
}

// Есть ли хотябы одна точка полигона на территории другого
function is_polygon_in_polygon (polygon1, polygon2) {

    let results = [];

    // Step 1

    let path = get_svg_path(polygon2);

    for (let i = 0; i < polygon1.length; i++) {

        let point = polygon1[i];

        if (is_point_in_polygon_w1([point.x, point.y], path)) {

            results[i] = true; //console.log('intersection - true')

        } else {

            results[i] = false;

        }

        for (let k = 0; k < polygon2.length; k++) {

            if (are_points_equal(point, polygon2[k])) {

                results[i] = true; //console.log('intersection - true')

            }

        }

    }

    // Анализируем результаты

    let result = true;

    // по умолчанию
    //is_point_inside_polygon(get_polygon_center(polygon1), polygon2) ? result = true : result = false;

    // но если есть хоть один false
    for (let i = 0; i < results.length; i++)
        if (results[i] === false)
            result = false;

    return result;

}




function is_polygon_in_polygon_new (polygon1, polygon2) {

    // смотрим какой полигон имеет больше точек
    let small, big;
    if (polygon1.length <= polygon2.length) {
        small = polygon1;
        big = polygon2;
    }
    if (polygon1.length > polygon2.length) {
        small = polygon2;
        big = polygon1;
    }

    //let result = false;
    //let inside = false;

    // считаем, сколько точек маленького полигона имеют равную точку большого полигона
    let true_counter = 0;
    for (let i = 0; i < small.length; i++) {

        for (let k = 0; k < big.length; k++) {

            if(are_points_equal(small[i], big[k])/* && !is_point_inside_polygon(small[i], big)*/) {

                true_counter ++;
            }
        }
    }

    // проверяем, лежит ли хоть одна точка маленького полигона внутри большого
    /*
        for (let i = 0; i < small.length; i++) {

            for (let k = 0; k < big.length; k++) {

                if() {

                    inside = true;
                    break;
                }
            }
        }
    */
    let result = true_counter === small.length

    console.log(small, big, true_counter, result);


    // если все точки маленького полигона имеют равную точку большого полигона
    // и ни одна точка маленького полигона не лежит внутри большого
    return true_counter === small.length/* && !inside*/;





    /*
        let results = [];

        // Step 1

        for (let i = 0; i < polygon1.length; i++) {

            let point = polygon1[i];

            is_point_inside_polygon(point, polygon2) ? results[i] = true : results[i] = false;

            for (let k = 0; k < polygon2.length; k++) {

                if (are_points_equal(polygon1[i], polygon2[k])) {

                    results[i] = true; //console.log('intersection - true')

                    console.log(polygon1, polygon2, i, k, results[i])

                }

            }

        }
    */


    /*
        for (let i = 0; i < polygon1.length - 1; i++) {

            let point = get_center(polygon1[i], polygon1[i + 1]);

            for (let k = 0; k < polygon2.length - 1; k++) {

                let line = {s: polygon2[k], e: polygon2[k + 1]};

                if (is_point_on_line(point, line))
                    results[i] = false;

            }

        }
    */


    // Анализируем результаты

    /*
        // по умолчанию
        let result = true;

        // но если есть хоть один false
        for (let i = 0; i < results.length; i++)
            if (results[i] === false)
                result = false;

        return result;
    */



    /*
                    let result = [];

                    let path = get_svg_path(polygon2);

                    for (let i = 0; i < polygon1.length; i++) {

                        let point = polygon1[i];

                        if (is_point_in_polygon_w1([point.x, point.y], path)) {

                            result.push(true); //console.log('intersection - true')

                        } else {

                            result.push(false); //console.log('intersection - true')

                        }

                    }
        */

    /*
                    for (let i = 0; i < result.length; i++) {

                        if (result[i] === false) return false;

                    }
        */


    //console.log('result', result)

    //return result;

}

function is_polygon_in_polygon_ (polygon1, index1, polygon2, index2) {

    // 1. Определяем какой из двух полигонов имеет меньше точек.

    let sm, bg, sm_index, bg_index;
    if (polygon1.length <= polygon2.length) {
        sm = polygon1.slice();
        sm_index = index1;
        bg = polygon2.slice();
        bg_index = index2;
    }
    if (polygon1.length > polygon2.length) {
        sm = polygon2.slice();
        sm_index = index2;
        bg = polygon1.slice();
        bg_index = index1;
    }

    // 2. Определяем сколько точек меньшего полигона совпадает с точками большого

    // создаем два массива
    let bg_equals = [];
    let bg_not_equals = bg.slice();

    // в equals складываем точки большего полигона, равные точкам меньшего
    for (let i = 0; i < sm.length; i++) {

        for (let k = 0; k < bg.length; k++) {

            if (are_points_equal(sm[i], bg[k])) {

                bg_equals.push(sm[i]);
            }
        }
    }

    // в not_equals складываем точки большего полигона, НЕ равные точкам меньшего
    for (let i = 0; i < bg_equals.length; i++) {

        for (let k = 0; k < bg_not_equals.length; k++) {

            if (are_points_equal(bg_equals[i], bg_not_equals[k])) {

                bg_not_equals.splice(k, 1);
                k--;
            }
        }
    }

    console.log(sm_index, bg_index, 'bg_equals', bg_equals.length, 'bg_not_equals', bg_not_equals.length)

    // 2. Определяем какой из двух полигонов обрамляет другой

    let inside = 0;
    let outside = 0;

    for (let i = 0; i < bg_not_equals.length; i++) {
        is_point_inside_polygon(bg_not_equals[i], sm) ? inside++ : outside++;
    }
    console.log(sm_index, bg_index, 'bg_equals', bg_equals.length, 'bg_not_equals', bg_not_equals.length)

    // если неравные точки большего полигона лежат на меньшем - меньший полигон обрамляет большой
    if (bg_not_equals.length === inside) {


        // на удаление - меньший полигон
        return sm_index;
    }
    // если неравные точки большего полигона НЕ лежат на меньшем - большой полигон обрамляет меньший
    if (bg_not_equals.length === outside) {

        if (is_point_inside_polygon(get_polygon_center(sm), bg)) {

            // на удаление - больший полигон
            return bg_index;

        }

    }


    /*








        //let result = false;
        //let inside = false;

        // считаем, сколько точек маленького полигона имеют равную точку большого полигона

        if (bg_equals.length === small.length) {

            console.log('bg_equals.length = small.length')

            let inside_small = 0;
            let outside_small = 0;

            for (let i = 0; i < bg_not_equals.length; i++) {
                is_point_inside_polygon(bg_not_equals[i], small) ? inside_small++ : outside_small++;
            }

            // поверяем, лежит ли центральная точка маленького полигона внутри большого полигона
            // вычисляем "центр" данной маленького полигона



            let small_center = get_polygon_center(small);
            let big_center = get_polygon_center(big);

            console.log(
                'inside_small', inside_small,
                'outside_small', outside_small,
                'big_index', big_index,
                'small_index', small_index,
            )
            console.log(
                'small_center', small_center,
                'small_center inside', is_point_inside_polygon(small_center, big),
                'big_center', big_center,
                'big_center inside', is_point_inside_polygon(big_center, small),
            )

            // большой полигон есть обрамляющий, маленький обрамляемый
            if (bg_not_equals.length === outside_small) {

                // и если центр маленького ноходится на территории большого
                if (is_point_inside_polygon(small_center, big))
                    return big_index;
            }

            // маленький полигон есть обрамляющий, большой обрамляемый
            if (bg_not_equals.length === inside_small) {

                // и если центр маленького ноходится на территории большого
                if (is_point_inside_polygon(big_center, small))
                    return small_index;
            }




        }
    */

    //return false;

    /*
        if (true_counter === small.length) {

            for (let i = 0; i < small.length; i++) {

                for (let k = 0; k < big.length; k++) {

                    if(are_points_equal(small[i], big[k])/!* && !is_point_inside_polygon(small[i], big)*!/) {

                        true_counter ++;
                        points.push(big[k]);
                    }
                }
            }





        }
    */

    // проверяем, лежит ли хоть одна точка маленького полигона внутри большого
    /*
        for (let i = 0; i < small.length; i++) {

            for (let k = 0; k < big.length; k++) {

                if() {

                    inside = true;
                    break;
                }
            }
        }
    */
    /*
        let result = true_counter === small.length

        console.log(small, big, true_counter, result);
    */

    // если все точки маленького полигона имеют равную точку большого полигона
    // и ни одна точка маленького полигона не лежит внутри большого
    /**//*return true_counter === small.length*//* && !inside*/;

    /*
        let results = [];

        // Step 1

        for (let i = 0; i < polygon1.length; i++) {

            let point = polygon1[i];

            is_point_inside_polygon(point, polygon2) ? results[i] = true : results[i] = false;

            for (let k = 0; k < polygon2.length; k++) {

                if (are_points_equal(polygon1[i], polygon2[k])) {

                    results[i] = true; //console.log('intersection - true')

                    console.log(polygon1, polygon2, i, k, results[i])

                }

            }

        }
    */

    /*
        for (let i = 0; i < polygon1.length - 1; i++) {

            let point = get_center(polygon1[i], polygon1[i + 1]);

            for (let k = 0; k < polygon2.length - 1; k++) {

                let line = {s: polygon2[k], e: polygon2[k + 1]};

                if (is_point_on_line(point, line))
                    results[i] = false;

            }

        }
    */

    // Анализируем результаты

    /*
        // по умолчанию
        let result = true;

        // но если есть хоть один false
        for (let i = 0; i < results.length; i++)
            if (results[i] === false)
                result = false;

        return result;
    */

    /*
                    let result = [];

                    let path = get_svg_path(polygon2);

                    for (let i = 0; i < polygon1.length; i++) {

                        let point = polygon1[i];

                        if (is_point_in_polygon_w1([point.x, point.y], path)) {

                            result.push(true); //console.log('intersection - true')

                        } else {

                            result.push(false); //console.log('intersection - true')

                        }

                    }
        */

    /*
                    for (let i = 0; i < result.length; i++) {

                        if (result[i] === false) return false;

                    }
        */

    //console.log('result', result)

    //return result;

}

// Преобразование координат точки экрана в svg точку
function get_svg_point(screen_point) {
    let svg_point = svg.node.createSVGPoint();
    svg_point.x = screen_point.x.toFixed(2);
    svg_point.y = screen_point.y.toFixed(2);
    let CTM = svg.node.getScreenCTM().inverse();
    svg_point = svg_point.matrixTransform(CTM);
    return {
        x: parseFloat(svg_point.x.toFixed(2)),
        y: parseFloat(svg_point.y.toFixed(2))
    }
}

//
function collect_walls_objects_paths () {

    cache.wall_objects_paths = [];

    for (let i = 0; i < walls.length; i ++) {

        for (let k = 0; k < walls[i].windows.length; k ++) {

            cache.wall_objects_paths.push(walls[i].windows[k].path);

        }

        for (let k = 0; k < walls[i].doors.length; k ++) {

            cache.wall_objects_paths.push(walls[i].doors[k].path);

        }

        for (let k = 0; k < walls[i].doorways.length; k ++) {

            cache.wall_objects_paths.push(walls[i].doorways[k].path);

        }

    }

}

// Преобразование координат svg точки в точку экрана
function get_screen_point(svg_point) {

    let screen_point = svg.node.createSVGPoint();

    screen_point.x = svg_point.x;
    screen_point.y = svg_point.y;

    let CTM = svg.node.getScreenCTM();

    return screen_point.matrixTransform(CTM);

}


//

// Получить вектор
function get_vector(line) {

    let s = line.s;
    let e = line.e;

    return {x: e.x - s.x, y: e.y - s.y};
};

// Получить вектор по точкам
function get_vector_by_points(s, e) {

    return {x: e.x - s.x, y: e.y - s.y};
};

//
//
function get_vertical (p) {

    return {
        s: {x: p.x, y: -1000000},
        e: {x: p.x, y: +1000000}
    }
}
function is_vertical (line) {
    return Math.abs(line.s.x - line.e.x) <= .1;
}
function is_horizontal (line) {
    return Math.abs(line.s.y - line.e.y) <= .1;
}
//
function get_horizontal (p) {
    return {
        s: {x: -1000000, y: p.y},
        e: {x: +1000000, y: p.y}
    }
}

function generate_id () {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 7 characters
    // after the decimal.
    return Math.random().toString(36).substr(2, 7);
};

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

//console.log(uuidv4())

function analyze_two_vectors (line1, line2) {

    let v1 = get_vector(line1);
    let v2 = get_vector(line2);

    // Векторы на плоскости коллинеарны тогда и только тогда, когда их псевдоскалярное (косое) произведение равно 0
    // Если векторы заданы своими координатами a(x1, y1), b(x2, y2) то косое произведение [a, b] = x1y2 — x2y1.
    let collinear = (v1.x * v2.y - v2.x * v1.y) === 0;

    // Векторы сонаправленны, если их скалярное произведение > 0
    let codirection = (v1.x * v2.x + v1.y * v2.y) > 0;

    return {collinear: collinear, codirection: codirection}

}


function delete_empties (array) {

    let result = [];
    for (let i = 0; i < array.length; i++) {
        if ( i in array ) {
            result.push(array[i]);
        }
    }
    return result;
}



// Запасные варианты

function get_svg_point_v2(screen_point) {

    let svg = document.getElementById("svgjs");
    let p = svg.createSVGPoint();
    p.x = screen_point.x;
    p.y = screen_point.y;

    return p.matrixTransform(svg.getScreenCTM().inverse());

}

function get_screen_point_v2(svg_point) {

    let svg = document.getElementById("svgjs");
    let p = svg.createSVGPoint()
    p.x = svg_point.x;
    p.y = svg_point.y;

    return p.matrixTransform(svg.getScreenCTM());

}



// Объединить две линии
function merge_two_lines(l1, l2) {

    let s, e;

    if (are_points_equal(l1.s, l2.s)) {
        s = copy_point(l1.e)
        e = copy_point(l2.e)
    }
    if (are_points_equal(l1.s, l2.e)) {
        s = copy_point(l1.e)
        e = copy_point(l2.s)
    }
    if (are_points_equal(l1.e, l2.s)) {
        s = copy_point(l1.s)
        e = copy_point(l2.e)
    }
    if (are_points_equal(l1.e, l2.e)) {
        s = copy_point(l1.s)
        e = copy_point(l2.s)
    }

    return {s: s, e: e};

};

// Объединить две линии
function merge_three_lines(l1, l2, l3) {

    let l1_l2 = merge_two_lines(l1, l2);
    let l2_l3 = merge_two_lines(l2, l3);
    let l = merge_two_lines(l1_l2, l2_l3);

    return {s: l.s, e: l.e};

};


// New ============================================================================================

// проекция точки на прямую
function get_point_projection (point, line) {

    let p = point;
    let s = line.s;
    let e = line.e;

    // исходная формула
    //let xk = xa + (xb - xa) * (((xs - xa) * (xb - xa) + (ys - ya) * (yb - ya) + (zs - za) * (zb - za)) / (Math.pow(xb - xa, 2) + Math.pow(yb - ya, 2) + Math.pow(zb - za, 2)));
    //let yk = ya + (yb - ya) * (((xs - xa) * (xb - xa) + (ys - ya) * (yb - ya) + (zs - za) * (zb - za)) / (Math.pow(xb - xa, 2) + Math.pow(yb - ya, 2) + Math.pow(zb - za, 2)));

    return {
        x: s.x + (e.x - s.x) * (((p.x - s.x) * (e.x - s.x) + (p.y - s.y) * (e.y - s.y)) / (Math.pow(e.x - s.x, 2) + Math.pow(e.y - s.y, 2))),
        y: s.y + (e.y - s.y) * (((p.x - s.x) * (e.x - s.x) + (p.y - s.y) * (e.y - s.y)) / (Math.pow(e.x - s.x, 2) + Math.pow(e.y - s.y, 2)))
    };
}

// Положение точки относительно отрезка - справа или слева
function get_point_place(point, line) {

    // Есть линия line = {s: {x: x, y: y}, e: {x: x, y: y}), и точка point {x: x, y: y}
    // Определяем, как расположена point относительно line.
    // Если d = 0 - значит, point лежит на line.
    // Если d > 0 - значит, point лежит слева от line.
    // Если d < 0 - значит, point С лежит справа от line.

    let distance = (point.x - line.s.x) * (line.e.y - line.s.y) - (point.y - line.s.y) * (line.e.x - line.s.x);
    if (distance === 0) return 'axis';
    if (distance > 0) return "L";
    if (distance < 0) return "R";
}

function in_array(needle, haystack, strict= false) {

    let found = false;
    strict = !!strict;

    for (let key in haystack) {
        if (haystack.hasOwnProperty(key)) {
            if ((strict && haystack[key] === needle) || (!strict && haystack[key] == needle)) {
                found = true;
                break;
            }
        }
    }

    return found;
}

function arrays_has_equals_elements(array1, array2) {

    for (let i = 0; i < array1.length; i++) {

        if (in_array(array1[i], array2)) {
            return true;
        }
    }

    return false;
}

function objects_has_equals_keys(object1, object2) {

    for (let key in object1) {
        if (!object1.hasOwnProperty(key)) continue;

        if (object2.hasOwnProperty(key)) {
            return true;
        }
    }

    return false;
}

function array_flip(array) {

    let result_array = {};

    for (let key in array) {
        if (array.hasOwnProperty(key)) {
            result_array[array[key]] = key;
        }
    }

    return result_array;
}

function get_rotation(line, point, angle) {

    angle = angle / 180 * Math.PI;

    let x1 = point.x + (line.s.x - point.x) * Math.cos(angle) - (line.s.y - point.y) * Math.sin(angle);
    let y1 = point.y + (line.s.y - point.y) * Math.cos(angle) - (line.s.x - point.x) * Math.sin(angle);
    let x2 = point.x + (line.e.x - point.x) * Math.cos(angle) - (line.e.y - point.y) * Math.sin(angle);
    let y2 = point.y + (line.e.y - point.y) * Math.cos(angle) - (line.e.x - point.x) * Math.sin(angle);

    return {s: {x: x1, y: y1}, e: {x: x2, y: y2}};
}

function closestPoint(p, p1, p2) {

    let d1 = get_distance(p, p1);
    let d2 = get_distance(p, p2);
    if (d1 < d2) return p1;
    if (d2 < d1) return p2;
}

function farthestPoint(p, p1, p2) {

    let d1 = get_distance(p, p1);
    let d2 = get_distance(p, p2);
    if (d1 > d2) return p1;
    if (d2 > d1) return p2;
}

// Продлить отрезок
function extendLine (line, sValue, eValue) {
    let newLine = {};
    newLine.s = copy.point(line.s);
    newLine.e = copy.point(line.e);
    if (sValue && sValue > 0) newLine.s = LIB.pointOnLine(line.e, line.s, sValue);
    if (eValue && eValue > 0) newLine.e = LIB.pointOnLine(line.s, line.e, eValue);
    return newLine;
}

function is_empty(value) {

    return !value
        || (Array.isArray(value) && value.length === 0)
        || (typeof value === 'object' && Object.keys(value).length === 0);
}

// получаем разницу между точками
function get_diff_point(point1, point2) {
    return get_point(point1.x - point2.x, point1.y - point2.y);
}

function get_sum_point(point1, point2) {
    return get_point(point1.x + point2.x, point1.y + point2.y);
}

function get_pseudo_tool_path(width, heigth) {
    let p1 = {x: 0, y: 0};
    let p2 = {x: width, y: 0};
    let p3 = {x: width, y: heigth};
    let p4 = {x: 0, y: heigth};
    return 'M' + p1.x + ',' + p1.y + ' ' +
        'L' + p2.x + ',' + p2.y + ' ' +
        'L' + p3.x + ',' + p3.y + ' ' +
        'L' + p4.x + ',' + p4.y + ' Z'
}

/*
CryptoJS v3.1.2
code.google.com/p/crypto-js
(c) 2009-2013 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var CryptoJS=CryptoJS||function(s,p){var m={},l=m.lib={},n=function(){},r=l.Base={extend:function(b){n.prototype=this;var h=new n;b&&h.mixIn(b);h.hasOwnProperty("init")||(h.init=function(){h.$super.init.apply(this,arguments)});h.init.prototype=h;h.$super=this;return h},create:function(){var b=this.extend();b.init.apply(b,arguments);return b},init:function(){},mixIn:function(b){for(var h in b)b.hasOwnProperty(h)&&(this[h]=b[h]);b.hasOwnProperty("toString")&&(this.toString=b.toString)},clone:function(){return this.init.prototype.extend(this)}},
    q=l.WordArray=r.extend({init:function(b,h){b=this.words=b||[];this.sigBytes=h!=p?h:4*b.length},toString:function(b){return(b||t).stringify(this)},concat:function(b){var h=this.words,a=b.words,j=this.sigBytes;b=b.sigBytes;this.clamp();if(j%4)for(var g=0;g<b;g++)h[j+g>>>2]|=(a[g>>>2]>>>24-8*(g%4)&255)<<24-8*((j+g)%4);else if(65535<a.length)for(g=0;g<b;g+=4)h[j+g>>>2]=a[g>>>2];else h.push.apply(h,a);this.sigBytes+=b;return this},clamp:function(){var b=this.words,h=this.sigBytes;b[h>>>2]&=4294967295<<
            32-8*(h%4);b.length=s.ceil(h/4)},clone:function(){var b=r.clone.call(this);b.words=this.words.slice(0);return b},random:function(b){for(var h=[],a=0;a<b;a+=4)h.push(4294967296*s.random()|0);return new q.init(h,b)}}),v=m.enc={},t=v.Hex={stringify:function(b){var a=b.words;b=b.sigBytes;for(var g=[],j=0;j<b;j++){var k=a[j>>>2]>>>24-8*(j%4)&255;g.push((k>>>4).toString(16));g.push((k&15).toString(16))}return g.join("")},parse:function(b){for(var a=b.length,g=[],j=0;j<a;j+=2)g[j>>>3]|=parseInt(b.substr(j,
            2),16)<<24-4*(j%8);return new q.init(g,a/2)}},a=v.Latin1={stringify:function(b){var a=b.words;b=b.sigBytes;for(var g=[],j=0;j<b;j++)g.push(String.fromCharCode(a[j>>>2]>>>24-8*(j%4)&255));return g.join("")},parse:function(b){for(var a=b.length,g=[],j=0;j<a;j++)g[j>>>2]|=(b.charCodeAt(j)&255)<<24-8*(j%4);return new q.init(g,a)}},u=v.Utf8={stringify:function(b){try{return decodeURIComponent(escape(a.stringify(b)))}catch(g){throw Error("Malformed UTF-8 data");}},parse:function(b){return a.parse(unescape(encodeURIComponent(b)))}},
    g=l.BufferedBlockAlgorithm=r.extend({reset:function(){this._data=new q.init;this._nDataBytes=0},_append:function(b){"string"==typeof b&&(b=u.parse(b));this._data.concat(b);this._nDataBytes+=b.sigBytes},_process:function(b){var a=this._data,g=a.words,j=a.sigBytes,k=this.blockSize,m=j/(4*k),m=b?s.ceil(m):s.max((m|0)-this._minBufferSize,0);b=m*k;j=s.min(4*b,j);if(b){for(var l=0;l<b;l+=k)this._doProcessBlock(g,l);l=g.splice(0,b);a.sigBytes-=j}return new q.init(l,j)},clone:function(){var b=r.clone.call(this);
            b._data=this._data.clone();return b},_minBufferSize:0});l.Hasher=g.extend({cfg:r.extend(),init:function(b){this.cfg=this.cfg.extend(b);this.reset()},reset:function(){g.reset.call(this);this._doReset()},update:function(b){this._append(b);this._process();return this},finalize:function(b){b&&this._append(b);return this._doFinalize()},blockSize:16,_createHelper:function(b){return function(a,g){return(new b.init(g)).finalize(a)}},_createHmacHelper:function(b){return function(a,g){return(new k.HMAC.init(b,
        g)).finalize(a)}}});var k=m.algo={};return m}(Math);
(function(s){function p(a,k,b,h,l,j,m){a=a+(k&b|~k&h)+l+m;return(a<<j|a>>>32-j)+k}function m(a,k,b,h,l,j,m){a=a+(k&h|b&~h)+l+m;return(a<<j|a>>>32-j)+k}function l(a,k,b,h,l,j,m){a=a+(k^b^h)+l+m;return(a<<j|a>>>32-j)+k}function n(a,k,b,h,l,j,m){a=a+(b^(k|~h))+l+m;return(a<<j|a>>>32-j)+k}for(var r=CryptoJS,q=r.lib,v=q.WordArray,t=q.Hasher,q=r.algo,a=[],u=0;64>u;u++)a[u]=4294967296*s.abs(s.sin(u+1))|0;q=q.MD5=t.extend({_doReset:function(){this._hash=new v.init([1732584193,4023233417,2562383102,271733878])},
    _doProcessBlock:function(g,k){for(var b=0;16>b;b++){var h=k+b,w=g[h];g[h]=(w<<8|w>>>24)&16711935|(w<<24|w>>>8)&4278255360}var b=this._hash.words,h=g[k+0],w=g[k+1],j=g[k+2],q=g[k+3],r=g[k+4],s=g[k+5],t=g[k+6],u=g[k+7],v=g[k+8],x=g[k+9],y=g[k+10],z=g[k+11],A=g[k+12],B=g[k+13],C=g[k+14],D=g[k+15],c=b[0],d=b[1],e=b[2],f=b[3],c=p(c,d,e,f,h,7,a[0]),f=p(f,c,d,e,w,12,a[1]),e=p(e,f,c,d,j,17,a[2]),d=p(d,e,f,c,q,22,a[3]),c=p(c,d,e,f,r,7,a[4]),f=p(f,c,d,e,s,12,a[5]),e=p(e,f,c,d,t,17,a[6]),d=p(d,e,f,c,u,22,a[7]),
        c=p(c,d,e,f,v,7,a[8]),f=p(f,c,d,e,x,12,a[9]),e=p(e,f,c,d,y,17,a[10]),d=p(d,e,f,c,z,22,a[11]),c=p(c,d,e,f,A,7,a[12]),f=p(f,c,d,e,B,12,a[13]),e=p(e,f,c,d,C,17,a[14]),d=p(d,e,f,c,D,22,a[15]),c=m(c,d,e,f,w,5,a[16]),f=m(f,c,d,e,t,9,a[17]),e=m(e,f,c,d,z,14,a[18]),d=m(d,e,f,c,h,20,a[19]),c=m(c,d,e,f,s,5,a[20]),f=m(f,c,d,e,y,9,a[21]),e=m(e,f,c,d,D,14,a[22]),d=m(d,e,f,c,r,20,a[23]),c=m(c,d,e,f,x,5,a[24]),f=m(f,c,d,e,C,9,a[25]),e=m(e,f,c,d,q,14,a[26]),d=m(d,e,f,c,v,20,a[27]),c=m(c,d,e,f,B,5,a[28]),f=m(f,c,
            d,e,j,9,a[29]),e=m(e,f,c,d,u,14,a[30]),d=m(d,e,f,c,A,20,a[31]),c=l(c,d,e,f,s,4,a[32]),f=l(f,c,d,e,v,11,a[33]),e=l(e,f,c,d,z,16,a[34]),d=l(d,e,f,c,C,23,a[35]),c=l(c,d,e,f,w,4,a[36]),f=l(f,c,d,e,r,11,a[37]),e=l(e,f,c,d,u,16,a[38]),d=l(d,e,f,c,y,23,a[39]),c=l(c,d,e,f,B,4,a[40]),f=l(f,c,d,e,h,11,a[41]),e=l(e,f,c,d,q,16,a[42]),d=l(d,e,f,c,t,23,a[43]),c=l(c,d,e,f,x,4,a[44]),f=l(f,c,d,e,A,11,a[45]),e=l(e,f,c,d,D,16,a[46]),d=l(d,e,f,c,j,23,a[47]),c=n(c,d,e,f,h,6,a[48]),f=n(f,c,d,e,u,10,a[49]),e=n(e,f,c,d,
            C,15,a[50]),d=n(d,e,f,c,s,21,a[51]),c=n(c,d,e,f,A,6,a[52]),f=n(f,c,d,e,q,10,a[53]),e=n(e,f,c,d,y,15,a[54]),d=n(d,e,f,c,w,21,a[55]),c=n(c,d,e,f,v,6,a[56]),f=n(f,c,d,e,D,10,a[57]),e=n(e,f,c,d,t,15,a[58]),d=n(d,e,f,c,B,21,a[59]),c=n(c,d,e,f,r,6,a[60]),f=n(f,c,d,e,z,10,a[61]),e=n(e,f,c,d,j,15,a[62]),d=n(d,e,f,c,x,21,a[63]);b[0]=b[0]+c|0;b[1]=b[1]+d|0;b[2]=b[2]+e|0;b[3]=b[3]+f|0},_doFinalize:function(){var a=this._data,k=a.words,b=8*this._nDataBytes,h=8*a.sigBytes;k[h>>>5]|=128<<24-h%32;var l=s.floor(b/
        4294967296);k[(h+64>>>9<<4)+15]=(l<<8|l>>>24)&16711935|(l<<24|l>>>8)&4278255360;k[(h+64>>>9<<4)+14]=(b<<8|b>>>24)&16711935|(b<<24|b>>>8)&4278255360;a.sigBytes=4*(k.length+1);this._process();a=this._hash;k=a.words;for(b=0;4>b;b++)h=k[b],k[b]=(h<<8|h>>>24)&16711935|(h<<24|h>>>8)&4278255360;return a},clone:function(){var a=t.clone.call(this);a._hash=this._hash.clone();return a}});r.MD5=t._createHelper(q);r.HmacMD5=t._createHmacHelper(q)})(Math);

// Calculate Levenshtein distance between two strings
function levenshtein(str1, str2) {
    // original by: Carlos R. L. Rodrigues
    var s, l = (s = str1.split("")).length, t = (str2 = str2.split("")).length, i, j, m, n;
    if (!(l || t)) return Math.max(l, t);
    for (var a = [], i = l + 1; i; a[--i] = [i]) ;
    for (i = t + 1; a[0][--i] = i;) ;
    for (i = -1, m = s.length; ++i < m;) {
        for (j = -1, n = str2.length; ++j < n;) {
            a[(i *= 1) + 1][(j *= 1) + 1] = Math.min(a[i][j + 1] + 1, a[i + 1][j] + 1, a[i][j] + (s[i] != str2[j]));
        }
    }
    return a[l][t];
}
function levenshtein_ratio(str1, str2) {
    let s1_len = str1.length;
    let s2_len = str2.length;
    let max_len = (s1_len > s2_len) ? s1_len : s2_len;
    return Math.round((1 - levenshtein(str1, str2) / max_len) * 100);
}


