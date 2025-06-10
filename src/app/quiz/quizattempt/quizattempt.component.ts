import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router'; // Import Router
import { CommonModule } from '@angular/common';
import { MinutesSecondsPipe } from '../../minutesseconds.pipe';

@Component({
  selector: 'app-quizattempt',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MinutesSecondsPipe],
  templateUrl: './quizattempt.component.html',
  styleUrls: ['./quizattempt.component.css']
})
export class QuizAttemptComponent implements OnInit {
  quizForm!: FormGroup;
  questions: any[] = [];
  timeLeft!: number;
  timerInterval!: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router // Inject Router
  ) {}

  ngOnInit(): void {
    const quizId = this.route.snapshot.params['quizId'];
    const userId = localStorage.getItem('userId');

    if (quizId && userId) {
      this.quizForm = this.fb.group({
        quizId: [quizId, Validators.required],
        courseId: ['', Validators.required],
        userId: [userId, Validators.required],
        responses: this.fb.array([])
      });

      const savedData = localStorage.getItem(`quizAttempt_${quizId}`);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        this.timeLeft = parsedData.timeLeft;
        this.questions = parsedData.questions;
        this.quizForm.patchValue(parsedData.quizForm);
        const responsesArray = this.quizForm.get('responses') as FormArray;
        parsedData.quizForm.responses.forEach(() => responsesArray.push(this.fb.control('', Validators.required)));
        this.startTimer();
      } else {
        this.loadQuiz(quizId);
      }
    } else {
      alert('Failed to fetch quizId or userId. Please try again.');
    }
  }

  loadQuiz(quizId: string): void {
    this.http.get(`http://localhost:9091/quiz/getById/${quizId}`, { headers: this.getAuthHeaders(), responseType: 'json' }).subscribe({
      next: (response: any) => {
        const quiz = response.quiz;
        const course = response.course;

        if (quiz && quiz.questions && quiz.options) {
          const courseId = course.courseId;
          this.quizForm.patchValue({ courseId });

          this.questions = quiz.questions.map((question: string, index: number) => ({
            text: question,
            options: quiz.options[index]
          }));

          const responsesArray = this.quizForm.get('responses') as FormArray;
          this.questions.forEach(() => responsesArray.push(this.fb.control('', Validators.required)));

          this.timeLeft = quiz.totalMarks * 60; // Convert minutes to seconds
          this.startTimer();
        } else {
          alert('Failed to load quiz questions. Please try again later.');
        }
      },
      error: (error) => {
        alert('Failed to load quiz data. Please try again later.');
      }
    });
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.saveProgress();
      } else {
        this.autoSubmitQuiz();
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  autoSubmitQuiz(): void {
    this.stopTimer();
    alert('Time is up! Submitting your quiz automatically.');
    this.clearProgress();
    this.onSubmit();
  }

  onSubmit(): void {
    if (this.quizForm.valid) {
      const formData = this.quizForm.value;

      const submissionData = {
        quizId: formData.quizId,
        courseId: formData.courseId,
        userId: formData.userId,
        responses: formData.responses.map((response: string) => response.trim())
      };

      this.http.post('http://localhost:9091/quiz/submit', submissionData, { headers: this.getAuthHeaders(), responseType: 'text' }).subscribe({
        next: () => {
          alert('Quiz submitted successfully!');
          this.clearProgress();
          this.stopTimer();
          //this.router.navigate(['/quizzes']); // Redirect to quiz list
        },
        error: (error) => {
          alert('You have already submitted this quiz.');
          this.clearProgress();
          console.log('clearprogress called'); // Debug log
          this.stopTimer();
          this.router.navigate(['/quizzes']); // Redirect to quiz list even on error
        }
      });
    } else {
      alert('Please answer all questions before submitting.');
      this.clearProgress();
    }
  }

  saveProgress(): void {
    const quizId = this.quizForm.get('quizId')?.value;
    const progressData = {
      timeLeft: this.timeLeft,
      questions: this.questions,
      quizForm: this.quizForm.value
    };
    localStorage.setItem(`quizAttempt_${quizId}`, JSON.stringify(progressData));
  }

  clearProgress(): void {
    const quizId = this.quizForm.get('quizId')?.value;
    console.log('Clearing progress for quizId:', quizId); // Debug log
    if (quizId) {
      localStorage.removeItem(`quizAttempt_${quizId}`);
      console.log(`Removed quizAttempt_${quizId} from localStorage`); // Debug log
    } else {
      console.error('quizId is undefined. Unable to clear progress.');
    }
  }

  get responses(): FormArray {
    return this.quizForm.get('responses') as FormArray;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}