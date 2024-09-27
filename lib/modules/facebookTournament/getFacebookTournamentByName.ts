import { FacebookTournamentModel } from "../../db/models/facebookTournament.model";
import toId from "../utils/toId";

export default async function getFacebookTournamentByName (name: string) {
    return await FacebookTournamentModel.findOne({
        id: toId(name)
    });
}
