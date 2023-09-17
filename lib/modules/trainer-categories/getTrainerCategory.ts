import toId from "../utils/toId";
import getTrainerCategoryName from "./getTrainerCategoryName";

export default function getTrainerCategory (rank: number) {
    return toId(getTrainerCategoryName(rank));
}
