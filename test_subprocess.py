import multiprocessing
import sys

def worker():
    print("Worker sys.executable:", sys.executable)
    print("Worker sys.path:", sys.path)
    try:
        import email_validator
        print("Worker successfully imported email_validator")
    except Exception as e:
        print("Worker import error:", e)

if __name__ == '__main__':
    multiprocessing.set_start_method("spawn")
    p = multiprocessing.Process(target=worker)
    p.start()
    p.join()
