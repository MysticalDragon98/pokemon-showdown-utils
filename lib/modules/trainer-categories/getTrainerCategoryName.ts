export default function getTrainerCategoryName (rank: number) {
    if (rank === 1) return "Champion";
    if (rank <= 3) return "Sub-Champion";
    if (rank <= 7) return "Elite-4";
    if (rank <= 15) return "Star-player";
    if (rank <= 31) return "Star-candidate";
    if (rank <= 63) return "Master";
    if (rank <= 127) return "Veteran";
    if (rank <= 512) return "Challenger";

    return "Rookie";
}
