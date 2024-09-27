import getCurrentBattle from "./getCurrentBattle";
import updateBattle from "./updateBattle";

export default async function clearCurrentBattle () {
    const currentBattle = await getCurrentBattle();

    if (!currentBattle) return;

    await updateBattle(currentBattle.id, { current: false });
}
