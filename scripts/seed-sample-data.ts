import { PrismaClient } from "../lib/generated/prisma";

const prisma = new PrismaClient();

async function main() {
	console.log("🌱 Seeding sample data...");

	// Note: You'll need to replace this with an actual user ID from your Clerk dashboard
	// This is just sample code - in real usage, get the actual userId from Clerk
	const sampleUserId = "user_sample_id_replace_with_real_one";

	// Create sample lists
	const workList = await prisma.list.create({
		data: {
			title: "Work Projects",
			userId: sampleUserId,
		},
	});

	const personalList = await prisma.list.create({
		data: {
			title: "Personal Goals",
			userId: sampleUserId,
		},
	});

	const shoppingList = await prisma.list.create({
		data: {
			title: "Shopping List",
			userId: sampleUserId,
		},
	});

	// Create sample tasks for Work Projects
	await prisma.task.createMany({
		data: [
			{
				title: "Complete project proposal",
				description: "Finish the Q1 project proposal for the client",
				completed: true,
				listId: workList.id,
			},
			{
				title: "Review pull requests",
				description: "Review and merge pending pull requests",
				completed: false,
				listId: workList.id,
			},
			{
				title: "Update documentation",
				description: "Update API documentation for new endpoints",
				completed: false,
				listId: workList.id,
			},
			{
				title: "Schedule team meeting",
				description: "Schedule weekly team sync meeting",
				completed: true,
				listId: workList.id,
			},
		],
	});

	// Create sample tasks for Personal Goals
	await prisma.task.createMany({
		data: [
			{
				title: "Exercise 3 times this week",
				description: "Go to the gym or do home workout",
				completed: true,
				listId: personalList.id,
			},
			{
				title: "Read 2 chapters of book",
				description: 'Continue reading "The Power of Habit"',
				completed: false,
				listId: personalList.id,
			},
			{
				title: "Learn TypeScript",
				description: "Complete TypeScript course on online platform",
				completed: true,
				listId: personalList.id,
			},
			{
				title: "Plan weekend trip",
				description: "Research and book weekend getaway",
				completed: false,
				listId: personalList.id,
			},
		],
	});

	// Create sample tasks for Shopping List
	await prisma.task.createMany({
		data: [
			{
				title: "Buy groceries",
				description: "Milk, bread, eggs, vegetables",
				completed: true,
				listId: shoppingList.id,
			},
			{
				title: "Get new laptop charger",
				description: "MacBook Pro charger replacement",
				completed: false,
				listId: shoppingList.id,
			},
			{
				title: "Pick up dry cleaning",
				description: "Suits and dress shirts",
				completed: false,
				listId: shoppingList.id,
			},
			{
				title: "Buy birthday gift",
				description: "Gift for Sarah's birthday party",
				completed: false,
				listId: shoppingList.id,
			},
		],
	});

	console.log("✅ Sample data seeding complete!");
	console.log(`Created 3 lists and 12 tasks for user: ${sampleUserId}`);
	console.log(
		"Note: Update the sampleUserId variable with your actual Clerk user ID",
	);
}

main()
	.catch((e) => {
		console.error("Error seeding data:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
