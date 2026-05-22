type CollegeRecord = {
  id: number;
  name: string;
  slug: string;
  location: string;
  feesPerYear: number;
  averagePlacement: number;
  highestPlacement: number;
  rating: number;
};

export function mapCollege(college: CollegeRecord) {
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
