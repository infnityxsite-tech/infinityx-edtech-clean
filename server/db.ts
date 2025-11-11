// server/db.ts - Firebase Firestore Database Operations
import db from "./firebase";
import { ENV } from "./_core/env";

// ==============================
// 👤 USER OPERATIONS
// ==============================

export interface User {
  id: string;
  openId: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}

export interface InsertUser {
  openId: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  role?: "user" | "admin";
  lastSignedIn?: Date;
}

export async function upsertUser(user: InsertUser) {
  const usersRef = db.collection("users");
  const existingQuery = await usersRef.where("openId", "==", user.openId).limit(1).get();

  const now = new Date();
  const role = user.role || (user.openId === ENV.ownerOpenId ? "admin" : "user");

  if (!existingQuery.empty) {
    // Update existing user
    const docId = existingQuery.docs[0].id;
    await usersRef.doc(docId).update({
      name: user.name,
      email: user.email,
      loginMethod: user.loginMethod,
      role,
      lastSignedIn: user.lastSignedIn || now,
      updatedAt: now,
    });
  } else {
    // Create new user
    await usersRef.add({
      openId: user.openId,
      name: user.name,
      email: user.email,
      loginMethod: user.loginMethod,
      role,
      createdAt: now,
      updatedAt: now,
      lastSignedIn: user.lastSignedIn || now,
    });
  }
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const snapshot = await db.collection("users").where("openId", "==", openId).limit(1).get();
  if (snapshot.empty) return undefined;
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as User;
}

// ==============================
// 📄 PAGE CONTENT OPERATIONS
// ==============================

export interface PageContent {
  id: string;
  pageKey: string;
  headline?: string | null;
  subHeadline?: string | null;
  missionText?: string | null;
  visionText?: string | null;
  studentsTrained?: number;
  expertInstructors?: number;
  jobPlacementRate?: number;
  heroImageUrl?: string | null;
  visionImageUrl?: string | null;
  bannerImageUrl?: string | null;
  founderImageUrl?: string | null;
  companyImageUrl?: string | null;
  missionImageUrl?: string | null;
  founderBio?: string | null;
  founderMessage?: string | null;
  aboutCompany?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type InsertPageContent = Omit<PageContent, "id" | "createdAt" | "updatedAt">;

export async function getPageContent(pageKey: string): Promise<PageContent | undefined> {
  const snapshot = await db.collection("pageContent").where("pageKey", "==", pageKey).limit(1).get();
  if (snapshot.empty) return undefined;
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as PageContent;
}

export async function updatePageContent(pageKey: string, data: Partial<InsertPageContent>) {
  const snapshot = await db.collection("pageContent").where("pageKey", "==", pageKey).limit(1).get();
  
  if (snapshot.empty) {
    // Create new
    await db.collection("pageContent").add({
      pageKey,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } else {
    // Update existing
    const docId = snapshot.docs[0].id;
    await db.collection("pageContent").doc(docId).update({
      ...data,
      updatedAt: new Date(),
    });
  }
}

// ==============================
// 📚 COURSE OPERATIONS
// ==============================

export interface Course {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  duration?: string | null;
  level?: string | null;
  instructor?: string | null;
  priceEgp: string;
  priceUsd: string;
  createdAt: Date;
  updatedAt: Date;
}

export type InsertCourse = Omit<Course, "id" | "createdAt" | "updatedAt">;

export async function getCourses(): Promise<Course[]> {
  const snapshot = await db.collection("courses").orderBy("createdAt", "desc").get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
}

export async function createCourse(data: InsertCourse) {
  const docRef = await db.collection("courses").add({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return { id: docRef.id, ...data };
}

export async function updateCourse(id: string, data: Partial<InsertCourse>) {
  await db.collection("courses").doc(id).update({
    ...data,
    updatedAt: new Date(),
  });
}

export async function deleteCourse(id: string) {
  await db.collection("courses").doc(id).delete();
}

// ==============================
// 🎓 PROGRAM OPERATIONS
// ==============================

export interface Program {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  duration?: string | null;
  skills?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type InsertProgram = Omit<Program, "id" | "createdAt" | "updatedAt">;

export async function getPrograms(): Promise<Program[]> {
  const snapshot = await db.collection("programs").orderBy("createdAt", "desc").get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Program));
}

export async function createProgram(data: InsertProgram) {
  const docRef = await db.collection("programs").add({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return { id: docRef.id, ...data };
}

export async function updateProgram(id: string, data: Partial<InsertProgram>) {
  await db.collection("programs").doc(id).update({
    ...data,
    updatedAt: new Date(),
  });
}

export async function deleteProgram(id: string) {
  await db.collection("programs").doc(id).delete();
}

// ==============================
// 📝 BLOG POST OPERATIONS
// ==============================

export interface BlogPost {
  id: string;
  title: string;
  author: string;
  content: string;
  summary?: string | null;
  imageUrl?: string | null;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type InsertBlogPost = Omit<BlogPost, "id" | "createdAt" | "updatedAt">;

export async function getBlogPosts(): Promise<BlogPost[]> {
  const snapshot = await db.collection("blogPosts").orderBy("publishedAt", "desc").get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
}

export async function createBlogPost(data: InsertBlogPost) {
  const docRef = await db.collection("blogPosts").add({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return { id: docRef.id, ...data };
}

export async function updateBlogPost(id: string, data: Partial<InsertBlogPost>) {
  await db.collection("blogPosts").doc(id).update({
    ...data,
    updatedAt: new Date(),
  });
}

export async function deleteBlogPost(id: string) {
  await db.collection("blogPosts").doc(id).delete();
}

// ==============================
// 💼 JOB LISTING OPERATIONS
// ==============================

export interface JobListing {
  id: string;
  title: string;
  location: string;
  description: string;
  requirements?: string | null;
  jobType?: string | null;
  salary?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type InsertJobListing = Omit<JobListing, "id" | "createdAt" | "updatedAt">;

export async function getJobListings(): Promise<JobListing[]> {
  const snapshot = await db.collection("jobListings").where("isActive", "==", true).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobListing));
}

export async function getAllJobListings(): Promise<JobListing[]> {
  const snapshot = await db.collection("jobListings").orderBy("createdAt", "desc").get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobListing));
}

export async function createJobListing(data: InsertJobListing) {
  const docRef = await db.collection("jobListings").add({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return { id: docRef.id, ...data };
}

export async function updateJobListing(id: string, data: Partial<InsertJobListing>) {
  await db.collection("jobListings").doc(id).update({
    ...data,
    updatedAt: new Date(),
  });
}

export async function deleteJobListing(id: string) {
  await db.collection("jobListings").doc(id).delete();
}

// ==============================
// 📋 STUDENT APPLICATION OPERATIONS
// ==============================

export interface StudentApplication {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  courseId: string;
  createdAt: Date;
}

export type InsertStudentApplication = Omit<StudentApplication, "id" | "createdAt">;

export async function getStudentApplications(): Promise<StudentApplication[]> {
  const snapshot = await db.collection("studentApplications").orderBy("createdAt", "desc").get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentApplication));
}

export async function createStudentApplication(data: InsertStudentApplication) {
  const docRef = await db.collection("studentApplications").add({
    ...data,
    createdAt: new Date(),
  });
  return { id: docRef.id, ...data };
}

export async function deleteStudentApplication(id: string) {
  await db.collection("studentApplications").doc(id).delete();
}

// ==============================
// 💬 CONTACT MESSAGE OPERATIONS
// ==============================

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  messageType: string;
  createdAt: Date;
}

export type InsertContactMessage = Omit<ContactMessage, "id" | "createdAt">;

export async function getContactMessages(): Promise<ContactMessage[]> {
  const snapshot = await db.collection("contactMessages").orderBy("createdAt", "desc").get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContactMessage));
}

export async function createContactMessage(data: InsertContactMessage) {
  const docRef = await db.collection("contactMessages").add({
    ...data,
    createdAt: new Date(),
  });
  return { id: docRef.id, ...data };
}

export async function deleteContactMessage(id: string) {
  await db.collection("contactMessages").doc(id).delete();
}

// ==============================
// ⚙️ SITE SETTINGS OPERATIONS
// ==============================

export interface SiteSetting {
  id: string;
  key: string;
  value?: string | null;
  createdAt: Date;
}

export type InsertSiteSetting = Omit<SiteSetting, "id" | "createdAt">;

export async function getSiteSetting(key: string): Promise<SiteSetting | undefined> {
  const snapshot = await db.collection("siteSettings").where("key", "==", key).limit(1).get();
  if (snapshot.empty) return undefined;
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as SiteSetting;
}

export async function setSiteSetting(key: string, value: string) {
  const snapshot = await db.collection("siteSettings").where("key", "==", key).limit(1).get();
  
  if (snapshot.empty) {
    await db.collection("siteSettings").add({
      key,
      value,
      createdAt: new Date(),
    });
  } else {
    const docId = snapshot.docs[0].id;
    await db.collection("siteSettings").doc(docId).update({ value });
  }
}
