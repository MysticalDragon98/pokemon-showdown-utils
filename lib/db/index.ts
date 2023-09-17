import { connect } from "mongoose";
import { $MONGO_URI } from "../env";
import { log } from "termx";

export async function initDatabaseConnection () {
    await connect($MONGO_URI);

    log("Connected to database!");
}