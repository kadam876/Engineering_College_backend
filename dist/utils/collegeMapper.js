"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapCollege = mapCollege;
function mapCollege(college) {
    return {
        id: college.id,
        name: college.name,
        slug: college.slug,
        location: college.location,
        feesPerYear: college.feesPerYear,
        averagePlacement: college.averagePlacement || 0,
        highestPlacement: college.highestPlacement || 0,
        rating: college.rating,
    };
}
