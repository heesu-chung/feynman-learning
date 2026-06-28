import { expect, test } from "@playwright/test";

test("local learning loop persists a weak child concept", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "파인만 러닝 OS" })).toBeVisible();
  await expect(page.getByRole("button", { name: /파인만 러닝 OS/ })).toBeVisible();
  await page.waitForFunction(() => localStorage.getItem("feynman-learning-os:concept-graph"));

  await page.getByPlaceholder("새 하위 노드").pressSequentially("테스트 개념");
  await expect(page.getByPlaceholder("새 하위 노드")).toHaveValue("테스트 개념");
  await page.getByRole("button", { name: "하위 노드 추가" }).click();
  await expect(page.getByLabel("제목")).toHaveValue("테스트 개념");

  await page.getByLabel("제목").fill("간격 반복");
  await expect(page.getByRole("heading", { name: "간격 반복" })).toBeVisible();
  await page.getByLabel("내 설명").fill("시간 간격을 두고 다시 설명해 기억을 확인한다.");
  await expect(page.getByLabel("내 설명")).toHaveValue(
    "시간 간격을 두고 다시 설명해 기억을 확인한다.",
  );
  await page.getByLabel("학습 상태").selectOption("explained");
  await expect(page.getByLabel("학습 상태")).toHaveValue("explained");

  await page.getByLabel("명확성").fill("0.1");
  await page.getByLabel("정확성").fill("0.1");
  await page.getByLabel("단순성").fill("0.1");
  await page.getByLabel("자신감").fill("0.1");

  const scorePanel = page.getByLabel("이해도 점수");
  await expect(scorePanel.getByText("약함")).toBeVisible();
  await page.waitForFunction(() =>
    localStorage.getItem("feynman-learning-os:concept-graph")?.includes("간격 반복"),
  );

  await page.reload();

  await expect(page.getByRole("button", { name: /간격 반복/ })).toBeVisible();
  await page.getByRole("button", { name: /간격 반복/ }).click();
  await expect(page.getByLabel("내 설명")).toHaveValue(
    "시간 간격을 두고 다시 설명해 기억을 확인한다.",
  );
  await expect(scorePanel.getByText("약함")).toBeVisible();
});
