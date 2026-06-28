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

test("shared URL hash restores the edited concept graph", async ({ page }) => {
  await page.goto("/");

  await page.waitForFunction(() => localStorage.getItem("feynman-learning-os:concept-graph"));

  await page.getByPlaceholder("새 하위 노드").fill("해시 공유 개념");
  await page.getByRole("button", { name: "하위 노드 추가" }).click();
  await expect(page.getByLabel("제목")).toHaveValue("해시 공유 개념");

  await page.getByLabel("내 설명").fill("URL 해시만으로 그래프를 다시 열 수 있어야 한다.");
  await expect(page.getByLabel("내 설명")).toHaveValue(
    "URL 해시만으로 그래프를 다시 열 수 있어야 한다.",
  );

  await page.getByRole("button", { name: "링크 복사" }).click();
  await expect(page).toHaveURL(/#.+/);
  const sharedHash = new URL(page.url()).hash;
  expect(sharedHash.length).toBeGreaterThan(1);

  await page.evaluate(() => localStorage.clear());
  await page.goto(`/${sharedHash}`);

  await expect(page.getByRole("button", { name: /해시 공유 개념/ })).toBeVisible();
  await page.getByRole("button", { name: /해시 공유 개념/ }).click();
  await expect(page.getByLabel("내 설명")).toHaveValue(
    "URL 해시만으로 그래프를 다시 열 수 있어야 한다.",
  );
});

test("reset clears shared URL state and returns to the default graph", async ({ page }) => {
  await page.goto("/");

  await page.waitForFunction(() => localStorage.getItem("feynman-learning-os:concept-graph"));

  await page.getByPlaceholder("새 하위 노드").fill("초기화 대상");
  await page.getByRole("button", { name: "하위 노드 추가" }).click();
  await expect(page.getByLabel("제목")).toHaveValue("초기화 대상");

  await page.getByLabel("내 설명").fill("초기화 후에는 이 설명이 남아 있으면 안 된다.");
  await expect(page.getByLabel("내 설명")).toHaveValue(
    "초기화 후에는 이 설명이 남아 있으면 안 된다.",
  );

  await page.getByRole("button", { name: "링크 복사" }).click();
  await expect(page).toHaveURL(/#.+/);

  await page.getByRole("button", { exact: true, name: "초기화" }).click();

  await expect(page).not.toHaveURL(/#.+/);
  await expect(page.getByRole("button", { name: /파인만 러닝 OS/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /내 말로 설명하기/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /약한 지점 복습하기/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /초기화 대상/ })).toHaveCount(0);
  await expect(page.getByLabel("제목")).toHaveValue("파인만 러닝 OS");
  await expect(page.getByLabel("내 설명")).toHaveValue("");
  await expect(page.getByText("초기화됨")).toBeVisible();
  await expect
    .poll(async () =>
      page.evaluate(() => localStorage.getItem("feynman-learning-os:concept-graph")),
    )
    .not.toContain("초기화 대상");
});

test("weak-node review moves a strengthened concept out of the review queue", async ({
  page,
}) => {
  await page.goto("/");

  await page.waitForFunction(() => localStorage.getItem("feynman-learning-os:concept-graph"));

  const reviewQueue = page.getByLabel("약한 노드 리뷰");
  await expect(reviewQueue.getByRole("heading", { name: "약한 노드 3개" })).toBeVisible();

  await page.getByRole("button", { name: "다음 약점" }).click();
  await expect(page.getByLabel("제목")).toHaveValue("내 말로 설명하기");

  await page.getByLabel("내 설명").fill("새 개념을 책 없이 내 언어로 다시 설명한다.");
  await page.getByLabel("명확성").fill("0.9");
  await page.getByLabel("정확성").fill("0.9");
  await page.getByLabel("단순성").fill("0.9");
  await page.getByLabel("자신감").fill("0.9");

  await expect(page.getByLabel("이해도 점수").getByText("안정")).toBeVisible();

  await page.getByRole("button", { name: "복습 완료로 표시" }).click();
  await expect(page.getByRole("button", { name: "복습 완료로 표시" })).toBeDisabled();
  await expect(page.getByRole("button", { name: /내 말로 설명하기/ })).toContainText(
    "복습 완료",
  );
  await expect(reviewQueue.getByRole("heading", { name: "약한 노드 2개" })).toBeVisible();

  await page.getByRole("button", { name: "다음 약점" }).click();
  await expect(page.getByLabel("제목")).toHaveValue("파인만 러닝 OS");

  await page.getByRole("button", { name: "다음 약점" }).click();
  await expect(page.getByLabel("제목")).toHaveValue("약한 지점 복습하기");

  await page.getByRole("button", { name: "약한 노드만" }).click();
  await expect(page.getByRole("button", { name: /내 말로 설명하기/ })).toHaveCount(0);
});
